// bushou jia.c 逮兽夹
// Create by Vin for Heros.cn

#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + CYN "捕兽夹" NOR, ({ "bushou jia", "bushou", "jia" }));
        set_weight(3000);
        set("long", NOR + CYN "夹齿锋利的捕兽夹，你可通过它布置("
                    HIY "snare" NOR + CYN ")陷阱来捕猎。\n" NOR);
        set("unit", "只");
        set("value", 10000);
        set("no_sell", 1);
        setup();
}

void init()
{
        add_action("do_snare", "snare");
}

int do_snare(string arg)
{
        object ob;
        object me;
        int time;

        me = this_player();

        if (me->query_skill("hunting", 1) < 20)
                return notify_fail("你的狩猎技巧不够娴熟，难以布置陷阱。\n");

        if (query_temp("id") != me->query("id")
           && query_temp("id")
           && environment() != me)
                return notify_fail("这是别人放置的捕兽夹，你动它做甚？\n");

        if (environment(me)->query("no_fight")
           || environment(me)->query("no_quarry"))
                return notify_fail("在这里放置捕兽夹？不太好吧。\n");

        if (query_temp("snare"))
                return notify_fail("捕兽夹已安置妥善，就等猎物上钩了。\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢，等一会儿吧。\n");

        if (me->is_fighting())
                return notify_fail("还是先把你面前的家伙放倒再说吧。\n");

        if (! objectp(ob = present("shi er", me))
           || ! ob->query_amount())
                return notify_fail("现在你身上没有食饵，难以布置陷阱。\n");

        ob->add_amount(-1);

        message_vision(HIR "\n$N" HIR "在" + name() + HIR "里放上食饵，轻轻"
                       "安置在地上，等待猎物上钩。\n\n" NOR, me);

        set_temp("snare", 1);
        set_temp("id", me->query("id"));

        if (environment() == me)
        {
                this_object()->move(environment(me));
                set("no_get", "捕兽夹的弹簧已然绷紧，乱动小心受伤。\n");
        }

        me->move(environment(me));

        time = 12 + random(12);

        remove_call_out("catch_quarry");
        call_out("catch_quarry", time, me);
        me->start_busy(time / 2 + 1);
        return 1;
}

void back_owner(object me)
{
        if (environment() != me)
        {
                this_object()->move(me);

                if (! me->is_busy())
                        me->start_busy(1);
        }
}

void catch_quarry(object me)
{
        object env;
        object quarry;
        mapping rs;
        string *st, msg;
        int i;
        int sum;
        int lvm, lvq, dam;

        delete_temp("snare");
        delete_temp("id");
        delete("no_get");

        env = environment(this_object());
        if (! objectp(me) || environment(me) != env || ! living(me))
        {
                message_vision(CYN "只听「喀嚓」一声，捕兽夹自动"
                               "合拢了。\n" NOR, this_object());
                return;
        }

        if (! mapp(env->query("quarrys"))
           || env->query("no_quarry")
           || env->query("no_fight"))
        {
                message_vision(CYN "等了半天，只听「喀嚓」一声，捕兽"
                               "夹自动合拢了，啥也没抓到。\n" HIC "看"
                               "来这个地方捕捉不了什么，$N" HIC "叹了"
                               "口气，将捕兽夹收回。\n" NOR, me);
                back_owner(me);
                return;
        }

        // 调用该地图的猎物
        rs = env->query("quarrys");

        st = keys(rs);
        sum = 0;

        for (i = 0; i < sizeof(st); i++)
        {
                if (! intp(rs[st[i]]))
                        rs[st[i]] = 0;

                sum += rs[st[i]];
        }

        if (! sum)
                return;

        sum = random(sum);

        for (i = 0; i < sizeof(st); i++)
        {
                if (sum < rs[st[i]])
                {
                        catch(quarry = new("/clone/quarry/" + st[i]));

                        if (! objectp(quarry))
                        	catch(quarry = new("/clone/beast/" + st[i]));

                        if (! objectp(quarry))
                                break;

                        msg = HIY "\n过得良久，$N" HIY "身后忽然晃出一" +
                              quarry->query("unit") + HIY + quarry->name() +
                              HIY "，闻得饵香后朝捕兽夹慢慢靠近。" NOR;

                        // 设定呼出者，即捕猎的奖励对象
                        quarry->set("owner", me->query("id"));
                        quarry->move(environment(me));

                        lvm = me->query_skill("hunting", 1) / 2;
                        lvq = quarry->query("power");
                        dam = lvm + random(lvm * 2);

                        if (lvm / 2 + random(lvm) < lvq && lvq <= 20)
                        {
                                msg += HIY "便在此时，忽听「喀嚓」一声，那"
                                       "捕兽夹竟然自动合上了。$n" HIY "受惊"
                                       "之下急忙奔逃，消失在了林子深处。\n"
                                       "\n" NOR;
                                message_sort(msg, me, quarry);
                                destruct(quarry);
                        } else
                        if (lvm / 2 + random(lvm) < lvq && lvq > 20)
                        {
                                msg += HIY "便在这个时候，忽然听得「喀嚓」"
                                       "一声，那只捕兽夹竟然自动合上了。$n"
                                       HIY "受惊之下勃然大怒，朝$N" HIY "直"
                                       "扑而去。\n\n" NOR;
                                message_sort(msg, me, quarry);
                                quarry->kill_ob(me);
                        }  else
                        if (lvm / 2 + random(lvm) > lvq * 4)
                        {
                                msg += HIY "只听「啪」的一声，$n" HIY "只顾"
                                       "觅食，不留神间已中了捕兽夹上的陷阱。"
                                       "那陷阱设得颇为精妙，那$n" HIY "不住"
                                       "挣扎，鲜血溅得四处都是。但只过得片刻"
                                       "，就再没了动静。\n" NOR;
                                message_sort(msg, me, quarry);
                                quarry->die(me);
                        }  else
                        if (lvm / 2 + random(lvm) > lvq * 3)
                        {
                                msg += HIY "只听「啪」的一声，$n" HIY "只顾"
                                       "觅食，不留神间已中了捕兽夹上的陷阱，"
                                       "登时被夹得鲜血直流。那$n" HIY "不停"
                                       "挣扎企图逃跑，结果触动伤口，顿时痛得"
                                       "昏了过去。\n" NOR;
                                message_sort(msg, me, quarry);
                                quarry->unconcious(me);
                        } else
                        {
                                msg += HIY "只听「啪」的一声，$n" HIY "只顾"
                                       "觅食，不留神间已中了捕兽夹上的陷阱，"
                                       "登时被夹得鲜血直流，痛声长呼。\n\n" NOR;
                                message_sort(msg, me, quarry);
                                quarry->receive_wound("qi", dam, me);
                                quarry->receive_wound("jing", dam, me);
                                quarry->kill_ob(me);
                        }
                        me->start_busy(1);
                        return;
                }
                sum -= rs[st[i]];
        }
        message_vision(CYN "等了半天，只听「喀嚓」一声，捕兽夹自动"
                       "合拢了，啥也没抓到。\n" HIC "$N" HIC "呆了"
                       "半天，摇了摇头，将捕兽夹收回。\n" NOR, me);
        back_owner(me);
}
