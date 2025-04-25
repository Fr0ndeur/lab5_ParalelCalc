#define WIN32_LEAN_AND_MEAN
#include <winsock2.h>
#include <ws2tcpip.h>
#include <thread>
#include <vector>
#include <queue>
#include <functional>
#include <mutex>
#include <condition_variable>
#include <fstream>
#include <sstream>
#include <iostream>

#pragma comment(lib, "Ws2_32.lib")

static const int PORT = 8080;
static const int THREAD_COUNT = 4;
static const std::string WWW = "static";

std::string get_type(const std::string& path) {
    if (path.size() >= 5 && path.rfind(".html") == path.size() - 5)
        return "text/html";
    if (path.size() >= 4 && path.rfind(".css") == path.size() - 4)
        return "text/css";
    if (path.size() >= 3 && path.rfind(".js") == path.size() - 3)
        return "application/javascript";
    if (path.size() >= 4 && path.rfind(".svg") == path.size() - 4)
        return "image/svg+xml";
    return "application/octet-stream";
}

class ThreadPool {
public:
    ThreadPool(size_t n) : stop(false) {
        for (size_t i = 0; i < n; ++i)
            workers.emplace_back([this]() {
            for (;;) {
                std::function<void()> task;
                {
                    std::unique_lock<std::mutex> lock(mtx);
                    cv.wait(lock, [this]() { return stop || !tasks.empty(); });
                    if (stop && tasks.empty()) return;
                    task = std::move(tasks.front());
                    tasks.pop();
                }
                task();
            }
                });
    }
    void enqueue(std::function<void()> f) {
        {
            std::lock_guard<std::mutex> lock(mtx);
            tasks.push(std::move(f));
        }
        cv.notify_one();
    }
    ~ThreadPool() {
        {
            std::lock_guard<std::mutex> lock(mtx);
            stop = true;
        }
        cv.notify_all();
        for (auto& t : workers) t.join();
    }
private:
    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;
    std::mutex mtx;
    std::condition_variable cv;
    bool stop;
};

void handle_client(SOCKET client) {
    char buf[4096];
    int len = recv(client, buf, sizeof(buf) - 1, 0);
    if (len <= 0) { closesocket(client); return; }
    buf[len] = '\0';

    std::istringstream ss(buf);
    std::string method, path, version;
    ss >> method >> path >> version;

    if (method != "GET") {
        const char* resp =
            "HTTP/1.1 405 Method Not Allowed\r\n"
            "Connection: close\r\n\r\n";
        send(client, resp, (int)strlen(resp), 0);
        closesocket(client);
        return;
    }

    if (path == "/" || path.empty()) path = "/index.html";
    std::string file_path = WWW + path;
    std::ifstream f(file_path, std::ios::binary);
    std::ostringstream body;
    std::string status;

    if (f) {
        body << f.rdbuf();
        status = "200 OK";
    }
    else {
        body << "<h1>404 Not Found</h1>";
        status = "404 Not Found";
    }

    std::string content = body.str();
    std::ostringstream resp;
    resp
        << "HTTP/1.1 " << status << "\r\n"
        << "Content-Length: " << content.size() << "\r\n"
        << "Content-Type: " << get_type(file_path) << "\r\n"
        << "Connection: close\r\n\r\n"
        << content;

    std::string out = resp.str();
    send(client, out.c_str(), (int)out.size(), 0);
    closesocket(client);
}

int main() {
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) return 1;

    SOCKET listenSock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(PORT);
    addr.sin_addr.s_addr = INADDR_ANY;
    bind(listenSock, (sockaddr*)&addr, sizeof(addr));
    listen(listenSock, SOMAXCONN);

    std::cout << "Minimal pool server listening on port " << PORT << "\n";
    ThreadPool pool(THREAD_COUNT);

    while (true) {
        SOCKET client = accept(listenSock, nullptr, nullptr);
        if (client == INVALID_SOCKET) continue;
        pool.enqueue([client]() { handle_client(client); });
    }

    closesocket(listenSock);
    WSACleanup();
    return 0;
}
