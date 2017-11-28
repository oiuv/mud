#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("张翠山", ({ "zhang cuishan", "zhang" }));  
        set("nickname", WHT "银钩铁划" NOR);
        set("long", @LONG
他就是张三丰的五弟子、武当七侠之中的张翠
山。身穿一件干干净净的白色道袍。
LONG);
        set("gender", "男性");
        set("age",31);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 28);
        set("int", 35);
        set("con", 28);
        set("dex", 28);
        set("max_qi", 5000);
        set("max_jing", 5000);
        set("neili", 4500);
        set("max_neili", 4500);
        set("jiali", 150);
        set("combat_exp", 1400000);
        set("score", 60000);

        set_skill("force", 220);
        set_skill("wudang-xinfa", 220);
        set_skill("taiji-shengong", 200);
        set_skill("dodge", 220);
        set_skill("tiyunzong", 220);
        set_skill("unarmed", 200);
        set_skill("taiji-quan", 180);
        set_skill("strike", 220);
        set_skill("yitian-zhang", 220);
        set_skill("wudang-zhang", 200);
        set_skill("hand", 200);
        set_skill("paiyun-shou", 200);
        set_skill("parry", 200);
        set_skill("sword", 220);
        set_skill("wudang-jian", 220);
        set_skill("taiji-jian", 200);
        set_skill("taoism", 200);
        set_skill("literate", 180);
        set_skill("martial-cognize", 200);

        set("no_teach", ([
                "taiji-shengong" : "要想学习太极神功请向张真人请教。",
                "taiji-jian"     : "太极剑必须张真人亲传。",
                "taiji-quan"     : "太极拳必须张真人亲传。",
        ]));

        map_skill("force", "taiji-shengong");
        map_skill("dodge", "tiyunzong");
        map_skill("unarmed", "taiji-quan");
        map_skill("parry", "taiji-quan");
        map_skill("sword", "taiji-jian");
        map_skill("strike", "yitian-zhang");

        prepare_skill("strike", "yitian-zhang");

        create_family("武当派", 2, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "strike.zheng" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
        }));

        setup();

        carry_object("/d/wudang/obj/whiterobe")->wear();
}

int accept_fight(object who)
{
        command("say 我是不会和你打架的！");
        return 0;
}

int accept_hit(object who)
{
        command("say 我是不会和你打架的！");
        return 0;
}

int accept_kill(object who)
{
        command("say 怎么，要行凶么？在这里恐怕由不得你！");
        return notify_fail("刹那间你觉得还是不要轻举妄动为好。\n");
}

int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见会场里黑压压的挤满了"
                           "人，根本看不清楚。\n");
}

void receive_damage(string type)
{
        return;
}

void receive_wound(string type)
{
        return;
}

int begin(object me)
{
        if (me->query_temp("compare"))
                return notify_fail("正在和别人比试呢！急什么急！\n");

        me->set_temp("compare", 1);

        command("say 阁下武功高强，就请持此屠龙刀去，却请饶了"
                "岛上一干人的性命。");

        remove_call_out("compare1");
        call_out("compare1", 3, me);
        me->set_temp("bizhang", 1);
        return 1;
}

void compare1(object me)
{
        if (me->query("family/family_name") != query("family/family_name"))
                message_vision(CYN "\n$N" CYN "冷笑道：敢问阁下是谁"
                               "，凭什么对我发号施令？我们先来比试"
                               "比试。\n" NOR, me);
        else
                message_vision(CYN "\n$N" CYN "沉声道：虽然我们同出"
                               "武当，但屠龙刀乃不世之物，我可信你"
                               "不过。\n\n" NOR, me);

        remove_call_out("compare2");
        call_out("compare2", 3, me);
}

void compare2(object me)
{
        command("say 我不跟你打架，只是比写几个字。");
        message_vision(HIR "\n张翠山说着缓步走到左首山峰前一堵大石壁"
                       "前，猛地里双脚一撑，提身而起。\n" NOR,
                       this_object());
        remove_call_out("compare3");
        call_out("compare3", 4, me);
}

void compare3(object me)
{
        message_vision(HIR "\n张翠山身形纵起丈余，跟着使出「梯云纵」绝"
                       "技，右脚在山壁一撑纵起两丈。\n\n只见他手中判官"
                       "笔看准石面，嗤嗤嗤几声，已写了一个「" HIY "武"
                       HIR "」字。\n" NOR, this_object());

        remove_call_out("compare4");
        call_out("compare4", 4, me);
}

void compare4(object me)
{
        message_vision(HIR "\n张翠山一个字写完，身子便要落下，突然左手"
                       "挥出，银钩在握，倏地一翻钩住石壁。\n\n这时他又"
                       "利用缝隙支住身子的重量，右手跟着又写了个「" HIY
                       "林" HIR "」字。\n" NOR, this_object());

        remove_call_out("compare5");
        call_out("compare5", 4, me);
}

void compare5(object me)
{
        message_vision(HIR "\n张翠山两个字写罢，跟着又写出「" HIY "至"
                       HIR "」字和「" HIY "尊" HIR "」字，但见石屑纷纷"
                       "而下。\n\n字迹或如灵蛇盘腾，或如猛兽屹立，须臾"
                       "间二十四字一齐写毕。\n" NOR, this_object());

        remove_call_out("compare6");
        call_out("compare6", 4, me);
}

void compare6(object me)
{
        message_vision(HIR "\n这一番石壁刻书，当真如李白诗云：\n\n"
                       HIW "\t\t飘风骤雨惊飒飒，落花飞雪何茫茫。\n\n"
                       "\t\t起来向壁不停手，一行数字大如斗。\n\n"
                       "\t\t恍恍如闻鬼神惊，时时只见龙蛇走。\n\n"
                       "\t\t左盘右蹙如惊雷，状同楚汉相攻战。\n\n" NOR,
                       this_object());

        remove_call_out("compare7");
        call_out("compare7", 4, me);
}

void compare7(object me)
{
        message_vision(HIR "\n张翠山写到「" HIY "锋" HIR "」字的最后一"
                       "笔，银钩在石壁上一撑，轻轻巧巧落在殷素素身旁。"
                       "\n" NOR, this_object());

        message_vision(CYN "\n$N" CYN "凝视着石壁上那三行大字，良久良"
                       "久，没有作声。\n" NOR, me);
        remove_call_out("shu");
        call_out("shu", 6, me);
}

void shu(object me)
{
        message_vision(CYN "\n$N" CYN "叹了口气，说道：我写不出，是我"
                       "输了。请问阁下有何吩咐？\n"NOR, me);
        me->delete_temp("bizhang");
        me->set_temp("shu", 1);
        remove_call_out("end");
        call_out("end", 5, me);
}

void end(object me)
{
        object ding, dao;
        object obj = present("yin susu");

        command("say 既是我胜了，就请饶了一干人的性命，我们走吧。");

        me->delete_temp("compare");
        ding = present("ding", environment());
        dao = present("tulong dao", ding);

        if (objectp(dao))
        {
                GIFT_D->delay_gift_bonus(me, ([ "temp"    : "skybook/tulong/tulongdao",
                                                "prompt"  : "你通过取得屠龙刀的经历",
                                                "rumor"   : "在王盘山大会击败各路英"
                                                            "豪，夺得了屠龙宝刀",
                                                "exp"     : random(15000) + 10000,
                                                "pot"     : random(1000) + 1000,
                                                "mar"     : random(1000) + 1000,
                                                "score"   : random(5000) + 3000,
                                                "weiwang" : random(5000) + 3000, ]));
                tell_object(me, HIM "\n你得到了屠龙宝刀。\n" NOR);
                me->set_temp("have_tulongdao");
                dao->move(me, 1);
        }
        message_vision(HIC "\n$N" HIC "和$n" HIC "等三人上船，扬帆而去"
                       "。\n\n" NOR, me, this_object());

        if (objectp(obj))
                obj->move("/b/tulong/boat");

        this_object()->move("/b/tulong/boat");
        me->move("/b/tulong/boat");

        remove_call_out("storm");
        call_out("storm", random(30), me);
}

void storm(object me)
{
        message_vision(HIB "\n突然之间，$N" HIB "身子一侧，滚了几"
                       "个转身，只听得疾风呼啸。\n波浪轰击之声，似"
                       "乎千百个巨浪同时袭到。\n" NOR, this_object());
        remove_call_out("storm2");
        call_out("storm2", 4, me);
}

void storm2(object me)
{
        message_vision(HIB "\n脚底下舱板斗然间向左侧去，船中的海水"
                       "又向外倒泻。\n但听得狂风呼啸，身周尽是海水"
                       "。\n" NOR, this_object());
        remove_call_out("storm3");
        call_out("storm3", 4, me);
}

void storm3(object me)
{
        message_vision(HIB "\n天上乌云慢慢散开，露出星夜之光。\n\n"
                       "船慢慢地向东向北飘流。\n" NOR, this_object());
        remove_call_out("storm4");
        call_out("storm4", 4, me);
}

void storm4(object me)
{
        message_vision(HIB "\n船慢慢地向东向北飘流。\n" NOR,
                       this_object());
        remove_call_out("storm5");
        call_out("storm5", 4, me);
}

void storm5(object me)
{
        message_vision(HIB "\n船慢慢地向东向北飘流。\n" NOR,
                       this_object());
        remove_call_out("storm6");
        call_out("storm6", 4, me);
}

void storm6(object me)
{
        message_vision(HIB "\n船慢慢地向东向北飘流。\n" NOR,
                       this_object());
        remove_call_out("arrive");
        call_out("arrive", 4, me);
}

void arrive(object me)
{
        object obj = present("yin susu");

        if (objectp(obj))
                obj->move("/b/tulong/boat3");

        message_vision(HIY "\n只见正北方一条大船向这方驶来，看来回到"
                       "中原了。\n\n" NOR, this_object());

        this_object()->move("/b/tulong/boat3");
        me->move("/b/tulong/boat3");

        message_vision(CYN "\n张翠山抱拳说道：咱们就此别过，后会有期。"
                       "\n\n" NOR, me, this_object());
}

void init()
{
       add_action("do_get", "get");
}

int do_get(string arg)
{
        object /*obj,*/ env/*, ding*/;
        string what, where;

        env = environment(this_player());

        if (env->short() != "扬刀立威会场")
                return 0;

        if (! arg)
                return 0;

        if (sscanf(arg, "%s from %s", what, where) != 2)
                return 0;

        if (objectp(present("mai jing", environment()))
           || objectp(present("guo sanquan",environment())))
              return 0;

        if (where == "ding")
        {
                message_vision(CYN "$N" CYN "说道：在下武当张翠"
                               "山，这厢有理了！\n" NOR, this_object());
                this_player()->delete_temp("bizhang");
                begin(this_player());
                return 1;
        }
        return 0;
}

int attempt_apprentice(object ob)
{
        command("say 我现在没空收徒！");
        return 0;
}
