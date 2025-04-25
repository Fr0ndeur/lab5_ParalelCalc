from locust import HttpUser, task, between

class StaticUser(HttpUser):
    wait_time = between(1, 2)

    @task(1)
    def index(self):
        with self.client.get("/", catch_response=True) as resp:
            if resp.elapsed.total_seconds() > 10:
                resp.failure(f"Too slow: {resp.elapsed.total_seconds():.3f}s")

    @task(1)
    def contact(self):
        with self.client.get("/contact.html", catch_response=True) as resp:
            if resp.elapsed.total_seconds() > 10:
                resp.failure(f"Too slow: {resp.elapsed.total_seconds():.3f}s")

    @task(1)
    def price(self):
        with self.client.get("/price.html", catch_response=True) as resp:
            if resp.elapsed.total_seconds() > 10:
                resp.failure(f"Too slow: {resp.elapsed.total_seconds():.3f}s")
    
    @task(1)
    def gtaVI(self):
        with self.client.get("/gtaVI.html", catch_response=True) as resp:
            if resp.elapsed.total_seconds() > 10:
                resp.failure(f"Too slow: {resp.elapsed.total_seconds():.3f}s")