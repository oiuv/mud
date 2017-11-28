// tracenpc.c

#include <ansi.h>
#include <quest.h>

inherit CLASS_D("generate") + "/chinese";

void create()
{
        mapping my;
        int lvl;

        ::create();
        set("gender", "男性" );
        set("age", 50 + random(40));
        set("attitude", "friendly");
        set("scale", 150);
        set_temp("apply/armor", 100);
        set_temp("apply/damage", 50);
        set_temp("born_time", time());

        lvl = 6 + random(6);
        NPC_D->init_npc_skill(this_object(), lvl);

        // 初始化NPC的能力
        my = query_entire_dbase();
        my["max_qi"] = 1000 + lvl * 300 + random(500);
        my["max_jing"] = my["max_qi"] / 2;
        my["max_neili"] = 1000 + lvl * 500 + random(500);
        my["eff_jing"] = my["max_jing"];
        my["jing"] = my["max_jing"];
        my["eff_qi"] = my["max_qi"];
        my["qi"] = my["max_qi"];
        my["neili"] = my["max_neili"] * 2;
}

varargs int move(mixed dest, int raw)
{
        int r;

        // 执行原本的MOVE函数
        r = ::move(dest, raw);

        if (query_temp("trace"))
        {
                remove_call_out("give_intercession");
                call_out("give_intercession", 2);
        }
        return r;
}

// 判断是否有人需要调解
void give_intercession()
{
        object ob;
        object me;
//      string msg;

        if (! query_temp("trace"))
                return;

        ob = query_temp("trace");
        ob = present(ob, environment(this_object()));

        if (! objectp(ob))
                return;

        if (environment(ob) != environment(this_object()))
                return;

        if (! living(ob))
                return;

        me = query_leader();
        message("vision", HIC + sort_msg(name() + "看见" + ob->name() +
                          HIC "，蓦地冲上前去，大叫道：“老天开眼啊，兄弟今"
                          "天终于寻到你了！”说罢只见两人拥在一起，热泪纵横"
                          "，场面煞是感人。\n" NOR), environment());
        if (objectp(me))
        {
                tell_object(me, HIY "\n你见两人此番状态，颇为感慨，不由得暗"
                                "自欣慰。\n\n" NOR);

                GIFT_D->bonus(me, ([ "exp" : 200 + random(100),
                                     "pot" : 200 + random(100),
                                     "score"   : 20 + random(20),
                                     "weiwang" : 10 + random(10),
                                     "prompt"  : "通过这次助人寻友" ]));
/*
                CHANNEL_D->do_channel(this_object(), "rumor", "听说" + me->name(1) +
                                                     "(" + me->query("id") + ")帮" +
                                                     name() + HIM "找到了失散的兄弟"
                                                     + ob->name() + HIM "。" NOR);
*/
                // 被列为门派中断的自由任务
                if (me->query("quest/freequest") > 0)
                        GIFT_D->delay_freequest_bonus(me);
        }
        delete_temp("trace");
        set_leader(0);
        destruct(ob);
        destruct(this_object());
}

void unconcious()
{
        die();
}