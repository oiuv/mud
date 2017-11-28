#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + CYN "铁八卦" NOR, ({ "tie bagua", "tie", "bagua" }));
        set_weight(2000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + CYN "这是一个生铁所铸的八卦盘，盘上雕"
                            "满了太极八卦\n纹样，制作得非常精致。风水师"
                            "常常借此来观测风\n水和卜卦，也可以用来破除"
                            "(" HIW "break" NOR + CYN ")各种奇门阵法。\n"
                            NOR);
                set("unit", "只");
                set("value", 300000);
                set("no_sell", 1);
                set("material", "steel");
        }
        setup();
}

void init()
{
        add_action("do_break", "break");
        add_action("do_break", "pozhen");
}

int do_break(string arg)
{
        object me, env, owner;
        int skill;

        me = this_player();
        env = environment(me);
        skill = (int)me->query_skill("qimen-wuxing", 1);

        if (me->is_busy()
           || me->query_temp("pending/exercising")
           || me->query_temp("exit_blocked"))
                return notify_fail("你现在正忙着呢。\n");

        if (skill < 1)
                return notify_fail("你把铁八卦翻来覆去摆弄了半天，却"
                                   "不知如何下手。\n");

        if (skill < 80)
                return notify_fail("你对奇门五行的研究不够，尚且无法"
                                   "破阵。\n");

        if (! env || ! env->query("th_buzhen"))
                return notify_fail("这里并没有被布下奇门阵法。\n");

        if (! objectp(owner = find_player(env->query("th_zhen_owner")))
           || environment(owner) != env)
        {
                env->set("long", env->query("org_desc"));
                env->set("exits", env->query("org_exits"));
                env->set("cost", env->query("org_cost"));
                env->delete("org_desc");
                env->delete("org_cost");
                env->delete("org_exits");
                env->delete("th_buzhen");
                env->delete("th_pozhen");
                env->delete("th_zhen_owner");

                tell_object(env, HIM "\n突然间紫雾朝周围散去，四面景致"
                                 "猛然一变。\n\n" NOR);
                return 1;
        }

        if (me != owner && me->query("max_jingli") < 500)
                return notify_fail("你的精力修为不足，难以破阵。\n");

        if (me != owner && me->query("jingli") < 300)
                return notify_fail("你目前的精力不足，难以破阵。\n");

        if (me != owner && me->query("jing") < 200)
                return notify_fail("你目前的精气不足，难以破阵。\n");

        if (me != owner && skill < env->query("th_pozhen") * 3 / 4)
        {
                message_vision(HIR "$N" HIR "坐在地上冥思苦想，突然脸色大"
                               "变，呕出一口鲜血。\n" NOR, me);
                me->receive_wound("jing", 100);
                me->start_busy(3);
                return 1;
        }

        if (me == owner && environment(owner) == env)
        {
	        message_vision(HIW "只见$N" HIW "袍袖一拂，紫雾顿时朝四面"
                               "散去，周围景致又恢复如初。\n" NOR, me);
                me->start_busy(2);
        } else
        {
                message_sort(HIW "\n$N" HIW "凝思片刻，须臾已将阵法的种种"
                             "生克变化全盘了然于胸，不禁仰天一声长笑，袍袖"
                             "一拂，掠入阵中。只见$N" HIW "掌劈脚挑，直激"
                             "得沙石四起，不一刻阵中之阴霾戾气四处飞散，消"
                             "逝得无影无踪。\n\n" NOR, me);
                me->receive_damage("jing", 100);
                me->add("jingli", -150);
                me->start_busy(3);
        }        
        env->set("long", env->query("org_desc"));
        env->set("exits", env->query("org_exits"));
        env->set("cost", env->query("org_cost"));
        env->delete("org_desc");
        env->delete("org_cost");
        env->delete("org_exits");
        env->delete("th_buzhen");
        env->delete("th_pozhen");
        env->delete("th_zhen_owner");

        return 1;
}
