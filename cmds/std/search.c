// search.c

// 在一个ROOM中寻找物品
// 由于SCORE的不同，寻找的对象和几率也不同。
// ROOM可以设置环境变量：search_objects，这样可以指定在在这
// 个房间中的某些物品的搜索几率。也可以设置no_search 指明如
// 果江湖阅历小于某一个值就不能找到（如果该值为零，那么将不
// 查阅该人的江湖阅历，这个物品将绝对不可能找到）。这两个变
// 量可以是设置房屋的正式变量也可以是临时变量，正是变量表示
// 房屋的环境，临时变量表示是房屋临时的搜寻信息。

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object env;

        seteuid(getuid());

        env = environment(me);

        if (me->is_busy())
                return notify_fail("等你忙完了手头的事情再找吧！\n");

        if (me->is_fighting())
                return notify_fail("一边打架一边找东西？只有你才想得出来！\n");

        if (env->query("no_search") == "all")
                return notify_fail("这地方看来找不出什么东西……\n");

        me->set_temp("pending/searching", 1);
        me->set_short_desc("正在东张西望。");

        message("vision", HIC "只见" + me->name() + HIC "深吸口气，四处东瞅"
                          "西望，不知道在干什么。\n" NOR,
                environment(me), ({ me }));

        tell_object(me, HIC "你开始在这里摸索，看有没有什么值钱的东西。\n" NOR);
        me->start_busy(bind((:call_other, __FILE__, "searching" :), me),
                       bind((:call_other, __FILE__, "halt_searching" :), me));
        return 1;
}

mapping query_default_objects(object me)
{
        int score = me->query("score");

        if (! environment(me)->query("outdoors"))
                return ([ ]);

        if (score < 100)
                return ([
                  "/clone/money/coin"       : 100000,
                  "/clone/money/silver"     : 20000,
                  "/clone/misc/jinchuang"   : 20000,
                  "/clone/weapon/dagger"    : 20000,
                  "/d/city/npc/obj/jiudai"  : 10000,
                  "/clone/weapon/duanjian"  : 6000,
                  "/clone/weapon/changjian" : 4000,
                  "/clone/weapon/blade"     : 4000,
                  "/clone/weapon/gangzhang" : 4000,
                  "/clone/cloth/tiejia"     : 3500, ]);
        else
        if (score < 400)
                return ([
                  "/clone/money/coin"       : 10000,
                  "/clone/money/silver"     : 15000,
                  "/clone/misc/jinchuang"   : 15000,
                  "/clone/weapon/dagger"    : 8000,
                  "/d/city/npc/obj/jiudai"  : 8000,
                  "/clone/weapon/duanjian"  : 3000,
                  "/clone/weapon/changjian" : 4000,
                  "/clone/weapon/blade"     : 4000,
                  "/clone/weapon/gangzhang" : 4000,
                  "/clone/cloth/tiejia"     : 3500, ]);
        else
        if (score < 2000)
                return ([
                  "/clone/money/coin"       : 5000,
                  "/clone/money/silver"     : 10000,
                  "/clone/misc/jinchuang"   : 25000,
                  "/clone/weapon/dagger"    : 20000,
                  "/d/city/npc/obj/jiudai"  : 10000,
                  "/clone/weapon/duanjian"  : 6000,
                  "/clone/weapon/changjian" : 4000,
                  "/clone/weapon/blade"     : 4000,
                  "/clone/weapon/gangzhang" : 4000,
                  "/clone/cloth/tiejia"     : 3500, ]);
        else
        if (score < 10000)
                return ([
                  "/clone/money/silver"     : 10000,
                  "/clone/misc/jinchuang"   : 20000,
                  "/clone/weapon/dagger"    : 10000,
                  "/d/city/npc/obj/jiudai"  : 5000,
                  "/clone/weapon/duanjian"  : 6000,
                  "/clone/weapon/changjian" : 4000,
                  "/clone/weapon/blade"     : 4000,
                  "/clone/weapon/gangzhang" : 4000,
                  "/clone/cloth/tiejia"     : 3500, ]);
        else
                return ([
                  "/clone/weapon/changjian" : 8000,
                  "/clone/weapon/blade"     : 8000,
                  "/clone/weapon/gangzhang" : 8000,
                  "/clone/cloth/tiejia"     : 2500, ]);
}

object found(object me, object env)
{
        mixed  *st;
        mapping cs, ns;
        mapping os;
        object  ob;
//      mixed   sob;
        int sum;
        int i;

        os = query_default_objects(me);
        if (mapp(cs = env->query_temp("search_objects")))
                os += cs;

        if (mapp(cs = env->query("search_objects")))
                os += cs;

        sum = me->query("score") >> 7;
        if (mapp(ns = env->query_temp("no_search")))
        {
                st = keys(ns);
                for (i = 0; i < sizeof(st); i++)
                {
                        if (! ns[st[i]] || sum < ns[st[i]])
                                // can not search this object or
                                // need score
                                map_delete(os, st[i]);
                }
        }

        if (mapp(ns = env->query("no_search")))
        {
                st = keys(ns);
                for (i = 0; i < sizeof(st); i++)
                {
                        if (! ns[st[i]] || sum < ns[st[i]])
                                // can not search this object or
                                // need score
                                map_delete(os, st[i]);
                }
        }

        if (sum > 30) sum = 30;
        if (env->query_temp("been/searched") > 0)
                sum -= env->query_temp("been/searched");
        if (random(sum + 100) < 93)
                return 0;

        st = keys(os);
        sum = 0;
        for (i = 0; i < sizeof(st); i++)
        {
                if (! intp(os[st[i]]))
                        os[st[i]] = 0;
                sum += os[st[i]];
        }

        if (! sum) return 0;
        sum = random(sum);
        for (i = 0; i < sizeof(st); i++)
        {
                if (sum < os[st[i]])
                {
                        if (stringp(st[i]))
                                ob = new(st[i]);
                        else
                        if (objectp(st[i]))
                                ob = st[i];
                        else
                        if (functionp(st[i]))
                                ob = evaluate(st[i], me, env);

                        if (! objectp(ob))
                                return 0;

                        env->add_temp("been/searched", 15);
                        return ob;
                }
                sum -= os[st[i]];
        }

        return 0;
}

int searching(object me)
{
        object env;
        object ob;

        env = environment(me);
        if (me->add_temp("pending/searching", 1) > 6)
        {
                tell_object(me, HIY "你找了半天，结果还是一无所获，只得放弃。\n" NOR);
                message("vision", HIC + me->name() + HIC "叹了口气，发了发呆。\n" NOR,
                                  env, ({ me }));
                me->set_short_desc(0);
                return 0;
        }

        if (me->query("qi") < 30 ||
            me->query("jing") < 30)
        {
                tell_object(me, HIY "你实在太疲倦了，只好放弃了寻找。\n" NOR);
                message("vision", HIC + me->name() + HIC "叹了口气，一脸倦容。\n" NOR,
                        env, ({ me }));
                me->set_short_desc(0);
                return 0;
        }

        me->receive_damage("qi", 30);
        me->receive_damage("jing", 30);

        ob = found(me, env);
        if (ob)
        {
                if (ob->query("base_unit"))
                        ob->set_amount(random(5) + 1);

                tell_object(me, HIW "你突然发现了一" + ob->query("unit") + ob->name() +
                                HIW "。\n" NOR);

                message("visoin", HIW + me->name() + HIW "突然弯下腰，不知道从地"
                                "上捡起了什么东西。\n" NOR, env, ({ me }));

                if (! ob->move(me, 1))
                {
                        tell_object(me, "可惜" + ob->name() + "对你来"
                                    "说太重了，你只好先放在地上。\n");
                }
                me->delete_temp("pending/searching");
                me->add("score", 1 + random(3));
                me->set_short_desc(0);
                return 0;
        } else
        {
                switch (random(8))
                {
                case 0:
                        message_vision(HIC "$N" HIC "叹了口气，继续东张西望的查"
                                       "看。\n" NOR, me);
                        break;
                case 1:
                        message_vision(HIC "$N" HIC "用脚拨了拨身前的土，似乎在"
                                       "找寻什么。\n" NOR, me);
                        break;
                case 2:
                        message_vision(HIC "$N" HIC "皱了皱眉头，又弯下腰仔细观"
                                       "察着地面的一切。\n" NOR, me);
                        break;
                case 3:
                        message_vision(HIC "$N" HIC "回转过头，仔细看了看身后的"
                                       "地面。\n" NOR, me);
                        break;
                case 4:
                        message_vision(HIC "$N" HIC "转过身子，伸出脚使劲踏了踏"
                                       "地面，探个虚实。\n" NOR, me);
                        break;
                case 5:
                        message_vision(HIC "$N" HIC "聚了聚神，又接着开始四处张"
                                       "望，不放过周围的一切。\n" NOR, me);
                        break;
                case 6:
                        message_vision(HIC "$N" HIC "探下身子，轻轻在周围的地面"
                                       "上敲击了几下。\n" NOR, me);
                        break;
                default:
                        message_vision(HIC "$N" HIC "咦了一声，弯下腰在地上拨拉"
                                       "什么东西。\n" NOR, me);
                        break;
		}
                return 1;
        }
}

int halt_searching(object me)
{
        object env;

        env = environment(me);
        me->delete_temp("pending/searching");
        tell_object(me, HIY "你放弃了寻找。\n" NOR);
        message("vision", HIC + me->name() + HIC "舒展了一下腰，叹了口气。\n"
                          NOR, env, ({ me }));
        me->set_short_desc(0);
        return 1;
}

int help (object me)
{
        write(@HELP
指令格式: search

在地上寻找东西。能找到什么呢？只有天才知道，某些地方能够找到
好东西。不过大部分地方只能找到一些普通的东西。如果你找到了东
西，你的江湖阅历将会因此而增长一点。
 
HELP );
        return 1;
}