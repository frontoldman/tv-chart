interface pubsubInter {
  publish?: Function;
  subscribe?: Function;
  unsubscribe?: Function;
}

const pubsub: pubsubInter = {};
(function (q) {

  var topics: any = {}, // 回调函数存放的数组
    subUid: number = -1;
  // 发布方法
  q.publish = function (topic: string, args: any) {

    if (!topics[topic]) {
      return false;
    }

    setTimeout(function () {
      var subscribers = topics[topic],
        len = subscribers ? subscribers.length : 0;

      while (len--) {
        subscribers[len].func(args, topic);
      }
    }, 0);

    return true;

  };

  //订阅方法
  q.subscribe = function (topic: string, func: Function) {

    if (!topics[topic]) {
      topics[topic] = [];
    }

    var token = (++subUid).toString();
    topics[topic].push({
      token: token,
      func: func
    });
    return token;
  };
  //退订方法
  q.unsubscribe = function (token: string) {
    for (var m in topics) {
      if (topics[m]) {
        for (var i = 0, j = topics[m].length; i < j; i++) {
          if (topics[m][i].token === token) {
            topics[m].splice(i, 1);
            return token;
          }
        }
      }
    }
    return false;
  };
}(pubsub));

export default pubsub