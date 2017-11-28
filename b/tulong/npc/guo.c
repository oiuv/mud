#include <ansi.h>
inherit NPC;

void create()
{
        set_name("过三拳", ({ "guo sanquan", "guo", "sanquan" }));
        set("long", @LONG
这是神拳门掌门人过三拳。身材高大，双臂肌
肉结实，一看就知道是外家好手。
LONG);
        set("title", "神拳门掌门人");
        set("attitude", "heroism");
        set("age", 56);
        set("str", 60);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("max_qi", 3500);
        set("max_jing", 3500);
        set("neili", 3500);
        set("max_neili", 3500);
        set("jiali", 300);
        set("combat_exp", 1500000);
        set("score", 10000);

        set_skill("force", 200);
        set_skill("riyue-xinfa", 200);
        set_skill("dodge", 180);
        set_skill("feiyan-zoubi", 180);
        set_skill("hammer", 180);
        set_skill("pangu-qishi", 180);
        set_skill("parry", 180);
        set_skill("cuff", 180);
        set_skill("zhenyu-quan", 180);
        set_skill("claw", 180);
        set_skill("poyue-zhao", 180);
        set_skill("martial-cognize", 180);
        set_skill("literate", 100);

        map_skill("dodge", "feiyan-zoubi");
        map_skill("force", "riyue-xinfa");
        map_skill("hammer", "pangu-qishi");
        map_skill("parry", "pangu-qishi");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");

        prepare_skill("claw", "poyue-zhao");
        prepare_skill("cuff", "zhenyu-quan");

        set_temp("apply/armor", 200);
        set_temp("apply/attack", 200);
        set_temp("apply/unarmed_damage", 1500);

        setup();

        carry_object("/d/beijing/npc/obj/cloth6")->wear();
}

void init()
{
        add_action("do_get", "get");
        add_action("do_compare", "compare");
}

int accept_fight(object who)
{
        command("say 我不和你蛮打，只和你比(" HIY "compare" NOR +
                CYN ")一些拳脚上的功夫。" NOR);
        return 0;
}

int accept_hit(object who)
{
        command("say 我不和你蛮打，只和你比(" HIY "compare" NOR +
                CYN ")一些拳脚上的功夫。" NOR);
        return 0;
}

int accept_kill(object who)
{
        command("say 怎么，想得屠龙刀就非得要行凶不成？");
        return notify_fail("霎时间你觉得还是不要轻举妄动为好。\n");
}

int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见会场里黑压"
                           "压的挤满了人，根本看不清楚。\n");
}

int begin(object me)
{
//      string msg;
        object ob = this_object();

        command("sneer");
        command("say 今日我如不趁人之危，定会死于阁下之手！");
        command("say 我神拳门绝技，乃是使用手上功夫，先吃我三拳再说。");

        message_vision(HIC "\n$N" HIC "喝道：嗨！我这第一拳叫做「"
                       HIR "催筋断骨" HIC "」。\n" NOR, ob);

        this_object()->add_temp("apply/attack", 100);
        this_object()->add_temp("apply/unarmed_damage", 100);
        COMBAT_D->do_attack(ob, me, query_temp("weapon"));

        message_vision(HIC "\n$N" HIC "喝道：好！再看我这第二拳「"
                       HIR "崩山裂石" HIC "」。\n" NOR, ob);

        this_object()->add_temp("apply/attack", 100);
        this_object()->add_temp("apply/unarmed_damage", 100);
        COMBAT_D->do_attack(ob, me, query_temp("weapon"));

        message_vision(HIC "\n$N" HIC "喝道：第三拳来了！这式叫做「"
                       HIY "横扫千军—直摧万马" HIC "」！\n" NOR, ob);

        this_object()->add_temp("apply/attack", 300);
        this_object()->add_temp("apply/unarmed_damage", 300);
        COMBAT_D->do_attack(ob, me, query_temp("weapon"));

        // 设定回初始状态
        this_object()->set_temp("apply/attack", 200);
        this_object()->set_temp("apply/unarmed_damage", 1500);

        set("anti", me);
        me->set_temp("compare", 1);

        if (me->query("max_neili") > 3000)
                die();

        return 1;
}

void die()
{
        if (objectp(query("anti")))
        {
                message_vision(HIR "\n$N" HIR "一拳端端正正的击中了$n"
                               HIR "的小腹。人身的小腹本来极是\n柔软，但$N"
                               HIR "着拳时如中铁石，刚知不妙，已狂喷鲜"
                               "血。\n" NOR, this_object(), query("anti"));
                query("anti")->set_temp("win_guo", 1);
                query("anti")->delete_temp("compare");
        }
        ::die();
}

int do_get(string arg)
{
        object obj = this_object();
        string what, where;

        if (! arg)
                return 0;

        if (objectp(obj = present("mai jing", environment())))
                return 0;

        if (sscanf(arg, "%s from %s", what, where) != 2)
                return 0;

        if (where == "ding")
        {
                message_vision(CYN "$N" CYN "哼了一声。\n" NOR, obj);
                message_vision(CYN "$N" CYN "说道：要想得到宝刀，先"
                               "过我三拳！\n" NOR, obj);
                this_player()->delete_temp("compare");
                return 1;
        }
        return 0;
}

int do_compare()
{
        object me = this_player();

        if (objectp(present("mai jing", environment())))
                return 0;

        begin(me);
        return 1;
}