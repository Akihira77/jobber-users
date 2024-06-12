import { Hono } from "hono"
import { setupHono } from "@users/server"
import { databaseConnection } from "../../database"

let app: Hono
let db: any
describe("Users Service Integration Testing", () => {
    beforeAll(async () => {
        db = await databaseConnection()
        app = new Hono()
        app = await setupHono(app)
    })

    afterAll(() => {
        db.connection.close()
    })

    describe("GET /buyer/email", () => {
        it("Harus mengembalikan status_code 200 dan data pembeli berdasarkan email yang terdapat pada JWT token", async () => {
            const res = await app.request("/buyer/email", {
                method: "GET",
                headers: new Headers({
                    Authorization:
                        "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTE1LCJlbWFpbCI6ImxpbGE2OUB5YWhvby5jb20iLCJ1c2VybmFtZSI6IlBhaW5mdWxwaWxsbyIsImlhdCI6MTcxODA3ODAzMiwiZXhwIjoxNzE4MTY0NDMyLCJpc3MiOiJKb2JiZXIgQXV0aCJ9.j8NhLPEqFuSqyariclu4zxZRQvOr4MAUHXvkOUMIVvcBfnlU_EOoXQnfdkZM8MbTG40SPCTgQ_mUOBl_3kbPmw"
                })
            })

            expect(res.status).toBe(200)
            const resBody = await res.json()
            expect(resBody).not.toBeNull()
            expect(resBody.message).not.toBeNull()
            expect(resBody.buyer).not.toBeNull()
        })

        it("Harus mengembalikan status_code 401 bahwa pembeli tidak ter-autentikasi", async () => {
            const res = await app.request("/buyer/email", {
                method: "GET"
            })

            expect(res.status).toBe(401)
            const resBody = await res.json()
            expect(resBody.message).not.toBeNull()
        })
    })

    describe("GET /buyer/username", () => {
        it("Harus mengembalikan status_code 200 dan data pembeli berdasarkan username yang terdapat pada JWT token", async () => {
            const res = await app.request("/buyer/username", {
                method: "GET",
                headers: new Headers({
                    Authorization:
                        "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTE1LCJlbWFpbCI6ImxpbGE2OUB5YWhvby5jb20iLCJ1c2VybmFtZSI6IlBhaW5mdWxwaWxsbyIsImlhdCI6MTcxODA3ODAzMiwiZXhwIjoxNzE4MTY0NDMyLCJpc3MiOiJKb2JiZXIgQXV0aCJ9.j8NhLPEqFuSqyariclu4zxZRQvOr4MAUHXvkOUMIVvcBfnlU_EOoXQnfdkZM8MbTG40SPCTgQ_mUOBl_3kbPmw"
                })
            })

            expect(res.status).toBe(200)
            const resBody = await res.json()
            expect(resBody).not.toBeNull()
            expect(resBody.message).not.toBeNull()
            expect(resBody.buyer).not.toBeNull()
        })

        it("Harus mengembalikan status_code 401 bahwa pembeli tidak ter-autentikasi", async () => {
            const res = await app.request("/buyer/username", {
                method: "GET"
            })

            expect(res.status).toBe(401)
            const resBody = await res.json()
            expect(resBody.message).not.toBeNull()
        })
    })

    describe("GET /buyer with param [/:username]", () => {
        it("Harus mengembalikan status_code 200 dan data pembeli yang ada pada database", async () => {
            const username = "Painfulpillo"
            const res = await app.request(`/buyer/${username}`, {
                method: "GET"
            })

            expect(res.status).toBe(200)
            const resBody = await res.json()
            expect(resBody).not.toBeNull()
            expect(resBody.message).not.toBeNull()
            expect(resBody.buyer).not.toBeNull()
        })

        it("Harus mengembalikan status_code 404 bahwa data pembeli tidak ditemukan pada database", async () => {
            const username = "not-found-username"
            const res = await app.request(`/buyer/${username}`, {
                method: "GET"
            })

            expect(res.status).toBe(404)
            const resBody = await res.json()
            expect(resBody.message).not.toBeNull()
        })
    })

    describe("GET /seller/id with param [/:sellerId]", () => {
        it("Harus mengembalikan status_code 200 dan data penjual yang ada pada database", async () => {
            const sellerId = "6644215d6fdffcf6c3a6d94e"
            const res = await app.request(`/seller/id/${sellerId}`, {
                method: "GET"
            })

            expect(res.status).toBe(200)
            const resBody = await res.json()
            expect(resBody).not.toBeNull()
            expect(resBody.message).not.toBeNull()
            expect(resBody.seller).not.toBeNull()
        })

        it("Harus mengembalikan status_code 404 bahwa data penjual tidak ditemukan pada database", async () => {
            const sellerId = "notfoundid"
            const res = await app.request(`/seller/id/${sellerId}`, {
                method: "GET"
            })

            expect(res.status).toBe(404)
            const resBody = await res.json()
            expect(resBody.message).not.toBeNull()
        })
    })

    describe("GET /seller/username with param [/:username]", () => {
        it("Harus mengembalikan status_code 200 dan data penjual yang ada pada database", async () => {
            const username = "Irritatingbo"
            const res = await app.request(`/seller/username/${username}`, {
                method: "GET"
            })

            expect(res.status).toBe(200)
            const resBody = await res.json()
            expect(resBody).not.toBeNull()
            expect(resBody.message).not.toBeNull()
            expect(resBody.seller).not.toBeNull()
        })

        it("Harus mengembalikan status_code 404 bahwa data penjual tidak ditemukan pada database", async () => {
            const username = "notfoundusername"
            const res = await app.request(`/seller/username/${username}`, {
                method: "GET"
            })

            expect(res.status).toBe(404)
            const resBody = await res.json()
            expect(resBody.message).not.toBeNull()
        })
    })

    describe("GET /seller/random with param [/:count]", () => {
        it("Harus mengembalikan status_code 200 dan 5 data penjual dari database", async () => {
            const count = 5
            const res = await app.request(`/seller/random/${count}`, {
                method: "GET"
            })

            expect(res.status).toBe(200)
            const resBody = await res.json()
            expect(resBody).not.toBeNull()
            expect(resBody.message).not.toBeNull()
            expect(resBody.sellers).not.toBeNull()
            expect(resBody.sellers.length).toBe(5)
        })

        it("Harus mengembalikan status_code 200 dan 10 data penjual dari database", async () => {
            const count = 10
            const res = await app.request(`/seller/random/${count}`, {
                method: "GET"
            })

            expect(res.status).toBe(200)
            const resBody = await res.json()
            expect(resBody.message).not.toBeNull()
            expect(resBody.sellers).not.toBeNull()
            expect(resBody.sellers.length).toBe(10)
        })
    })

    describe("POST /seller/create", () => {
        it("Harus mengembalikan status_code 400 bahwa request_body yang dikirimkan tidak valid #1", async () => {
            const reqBody = {}

            const res = await app.request("/seller/create", {
                method: "POST",
                body: JSON.stringify(reqBody),
                headers: new Headers({ "Content-Type": "application/json" })
            })

            const resBody = await res.json()
            expect(res.status).toBe(400)
            expect(resBody).not.toBeNull()
            expect(resBody.message).not.toBeNull()
            expect(resBody.message).toBe("Fullname is required")
        })

        it("Harus mengembalikan status_code 400 bahwa request_body yang dikirimkan tidak valid #2", async () => {
            const reqBody = {
                fullName: "",
                username: "",
                email: "",
                profilePublicId: "",
                profilePicture: "",
                description: "",
                country: "",
                oneline: "",
                skills: [],
                languages: [],
                responseTime: "",
                experience: [],
                education: [],
                socialLinks: [],
                certificates: []
            }

            const res = await app.request("/seller/create", {
                method: "POST",
                body: JSON.stringify(reqBody),
                headers: new Headers({ "Content-Type": "application/json" })
            })

            const resBody = await res.json()
            expect(res.status).toBe(400)
            expect(resBody).not.toBeNull()
            expect(resBody.message).not.toBeNull()
            expect(resBody.message).toBe("Fullname is required")
        })
    })

    describe("PUT /seller with param [/:sellerId]", () => {
        it("Harus mengembalikan status_code 404 bahwa data penjual tidak ditemukan pada database", async () => {
            const reqBody = {}
            const sellerId = "6644215d6fdffcf6c3a6d94e"
            const res = await app.request(`/seller/$${sellerId}`, {
                method: "PUT",
                headers: new Headers({ "Content-Type": "application/json" }),
                body: JSON.stringify(reqBody)
            })

            const resBody = await res.json()
            expect(res.status).toBe(404)
            expect(resBody).not.toBeNull()
            expect(resBody.message).not.toBeNull()
            expect(resBody.message).toBe("Seller account did not found.")
        })

        it("Harus mengembalikan status_code 400 bahwa request_body yang dikirimkan tidak valid", async () => {
            const sellerId = "6644215d6fdffcf6c3a6d94e"
            const reqBody = {
                fullName: "",
                username: "",
                email: "",
                profilePublicId: "",
                profilePicture: "",
                description: "",
                country: "",
                oneline: "",
                skills: [],
                languages: [],
                responseTime: "",
                experience: [],
                education: [],
                socialLinks: [],
                certificates: []
            }

            const res = await app.request(`/seller/${sellerId}`, {
                method: "PUT",
                body: JSON.stringify(reqBody),
                headers: new Headers({ "Content-Type": "application/json" })
            })

            const resBody = await res.json()
            expect(res.status).toBe(400)
            expect(resBody).not.toBeNull()
            expect(resBody.message).not.toBeNull()
            expect(resBody.message).toBe("Fullname is required")
        })
    })
})
