function error(message: string) {
  console.log(message);
  return {
    error: true,
    message,
  };
}

function success(data: any) {
  console.log(data);
  return {
    error: false,
    data,
  };
}

export { error, success };
