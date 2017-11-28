// quester.c 接收请求任务

int is_quester() { return 1; }

// 请求任务
int ask_quest(object who)
{
        return QUEST_D->ask_quest(this_object(), who);
}

// 取消任务
int cancel_quest(object who)
{
        return QUEST_D->cancel_quest(this_object(), who);
}
