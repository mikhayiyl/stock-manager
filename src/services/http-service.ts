import apiClient from "./api-client";

interface Entity {
  id: string;
}

class HttpService {
  endpoint = "";

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }
  getAll<T>(params?: Record<string, any>) {
    const controller = new AbortController();
    const request = apiClient.get<T[]>(this.endpoint, {
      signal: controller.signal,
      params,
    });

    return { request, cancel: () => controller.abort() };
  }

  delete(id: string) {
    return apiClient.delete(this.endpoint + "/" + id);
  }

  update<T extends Entity>(entity: T) {
    return apiClient.put(this.endpoint + "/" + entity.id, entity);
  }

  patch<T>(id: string, data: Partial<T>) {
    return apiClient.patch(this.endpoint + "/" + id, data);
  }

  create<T>(entity: T) {
    return apiClient.post(this.endpoint, entity);
  }
}

const create = (endpoint: string) => new HttpService(endpoint);

export default create;
