// quest.h

// QUEST基础对象
#define QUEST_OB                "/inherit/misc/quest"

// 任务对象的函数
varargs string name();
varargs string query_introduce(object knower, object who);
varargs int    can_know_by(object knower);
varargs int    can_rumor_by(object knower);

// 功能函数
varargs void   set_information(string key, string info);
varargs void   set_name(string name);

// 状态机函数
string  query_status();
void    change_status(string new_state);

// 任务对象的系统状态
#define QUEST_CREATE            "created" /* 任务创建     */
#define QUEST_READY             "ready"   /* 任务就绪     */
#define QUEST_FINISH            "finish"  /* 任务完成     */
#define QUEST_ERROR             "error"   /* 任务错误状态 */

// 任务对象的系统事件
#define QUEST_TIMEOUT           "timeout" /* 任务超时     */

// 在创建状态最长的停留时间
#define QUEST_CREATE_PERIOD     30

// 在结束状态最长的停留时间
#define QUEST_FINISH_PERIOD     30

void    register_information();
