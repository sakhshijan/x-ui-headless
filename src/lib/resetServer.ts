import child_process from "child_process";

export function resetServer() {
  child_process.exec("x-ui restart", console.log);
}
