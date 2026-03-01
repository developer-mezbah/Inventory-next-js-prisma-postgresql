class api_fetch_fun {
  async create(api, token, obj) {
    try {
      const response = await fetch(api, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      });

      return response.json();
    } catch (e) {
      return false;
    }
  }
  async get(api, token) {
    try {
      const response = await fetch(api, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    } catch (e) {
      return false;
    }
  }
  async update(api, token, obj) {
    try {
      const response = await fetch(api, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      });

      return response.json();
    } catch (e) {
      return false;
    }
  }
  async delete(api, token) {
    try {
      const response = await fetch(api, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const responseData = await response.json();
      if (responseData.status === true) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}

const client_api = new api_fetch_fun();

export default client_api;