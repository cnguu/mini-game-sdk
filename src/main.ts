import BasicService from "@/services/basic";

// @ts-ignore
import __platform__Service from "@/services/__platform__";

export default class MySdk {
  private sService: BasicService;

  get service(): BasicService {
    if (!this.sService) {
      this.sService = new __platform__Service();
    }

    return this.sService;
  }
}
