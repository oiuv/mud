// divorce.c

#include <room.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object witness;
        mapping couple;
        object  user;
        string  msg;

        seteuid(getuid());

        if (! mapp(couple = me->query("couple")))
                return notify_fail("你现在好像是单身一人吧？\n");

        if (! arg)
                return notify_fail("你要和谁解除婚约？\n");

        if (arg == me->query("id"))
                return notify_fail("疯了...你真的疯了...\n");

        if (arg != me->query("couple/id"))
                return notify_fail("这人和你现在并不是夫妻关系啊！\n");

        if (objectp(witness = present("marriage witness", environment(me))))
                return witness->do_divorce(me);

        if (! me->query_temp("pending/want_divorce"))
        {
                write("你身边连个证婚的人都没有，就像草草的离了"
                      "算了？要是这样，你就在输入一次这个指令表示决心。\n");
                me->set_temp("pending/want_divorce", 1);
                return 1;
        }

        write("你下定决心，一定要和" + me->query("couple/name") + "彻底分手！\n");

        CHANNEL_D->do_channel(me, "chat",
                "我" + me->name(1) + "从今天起就和" + couple["name"] +
                "(" + couple["id"] + ")彻底断绝关系！");

        user = find_player(couple["id"]);
        if (user)
        {
                switch (user->query("character"))
                {
                case "光明磊落":
                        msg = "天哪！" + me->name(1) + "你这没有良心的" +
                              RANK_D->query_rude(me) + "！";
                        break;

                case "狡黠多变":
                        msg = "哼..哼！嘿！走吧，走吧！";
                        break;

                case "心狠手辣":
                        msg = "好你个" + me->name(1) + "，咱们走着瞧！";
                        break;

                default:
                        msg = "很好，" + me->name(1) + "你等着吧！";
                        break;
                }

                CHANNEL_D->do_channel(user, "chat", msg);
        }

        UPDATE_D->clear_user_data(me->query("id"), "couple");
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : divorce
 
离婚。意思就是以后各走各的路。
 
see also : divorce
HELP );
    return 1;
}
