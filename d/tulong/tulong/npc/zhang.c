#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("张翠山", ({ "zhang cuishan", "zhang" }));  
        set("long",
        "一个二十一二岁的少年，面目俊秀，虽然略觉清\n"
        "癯，但神朗气爽，身形的瘦弱竟掩不住一股剽悍\n"
        "之意。\n");
        set("attitude", "heroism");
        set("title", "武当五侠");
        set("nickname", WHT"银钩铁划"NOR);
        set("per", 30);
        set("age", 21);
        set("shen_type", 1);
        set("combat_exp", 1400000);
        set("score", 60000);

        set_skill("unarmed", 200+random(50));
        set_skill("parry", 200+random(50));
        set_skill("dodge", 200+random(50));

        create_family("武当派", 2, "弟子");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/beijing/npc/obj/cloth1")->wear();
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
	return 1;
}
int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见会场里黑压压的挤满了人，根本看不清楚。\n");
}
void receive_damage(string type, int n)
{
        return;
}
void receive_wound(string type, int n)
{
        return;
}
int begin(object me)
{
        if (me->query_temp("biwu"))
        return notify_fail("正在和别人比试呢！急什么急！\n");

        me->set_temp("biwu",1);
        command("say 阁下武功高强，就请持此屠龙刀去，却请饶了岛上一干人的性命。");
        message_vision(CYN "$N说道：敢问阁下是谁，凭什么对我发号施令，我们先来比试比试。\n" NOR, me);
        message_vision(CYN "$N说道：兵刃、拳脚、内功、暗器、轻功、水功，随便哪一桩，由你自己挑，我都奉陪。\n" NOR, me);
        remove_call_out("biwu");
        call_out("biwu",3,me);
        me->set_temp("bizhang",1);
        return 1;
}
void biwu(object me)
{
        command("say 我不是跟你比兵刃，只是比写几个字。");
        message_vision(HIR "\n张翠山说着缓步走到左首山峰前一堵大石壁前，吸一口气，猛地里双脚一撑，提身而起。\n"NOR,this_object());
        remove_call_out("biwu2");
        call_out("biwu2",8,me);
}
void biwu2(object me)
{
        message_vision(HIR "\n张翠山身形纵起丈余，跟着使出“梯云纵”绝技，右脚在山壁一撑，一借力，又纵起两丈。\n"NOR,this_object());
        message_vision(HIR "\n手中判官笔看准石面，嗤嗤嗤几声，已写了一个“"NOR+HIY"武"NOR+HIR"”字。\n"NOR,this_object());
        message_vision(HIR "\n张翠山一个字写完，身子便要落下，突然左手挥出，银钩在握，倏地一翻，钩住了石壁的缝隙。\n"NOR,this_object());
        message_vision(HIR "\n利用缝隙支住身子的重量，右手跟着又写了个“"NOR+HIY"林"NOR+HIR"”字。\n"NOR,this_object());
        remove_call_out("biwu3");
        call_out("biwu3",8,me);
}
void biwu3(object me)
{
        message_vision(HIR "\n张翠山两个字写罢，跟着又写“"NOR+HIY"至"NOR+HIR"”字，“"NOR+HIY"尊"NOR+HIR"”字。越写越快，但见石屑纷纷而下。\n" NOR, this_object());
        message_vision(HIR "\n字迹或如灵蛇盘腾，或如猛兽屹立，须臾间二十四字一齐写毕。\n\n" NOR, this_object());
        message_vision(HIR "这一番石壁刻书，当真如李白诗云：\n\n"NOR,this_object());
        message_vision(HIW "            飘风骤雨惊飒飒，落花飞雪何茫茫。\n\n" NOR, this_object());
        message_vision(HIW "            起来向壁不停手，一行数字大如斗。\n\n" NOR, this_object());
        message_vision(HIW "            恍恍如闻鬼神惊，时时只见龙蛇走。\n\n" NOR, this_object());
        message_vision(HIW "            左盘右蹙如惊雷，状同楚汉相攻战。\n\n" NOR, this_object());
        message_vision(HIR "\n张翠山写到“锋”字的最后一笔，银钩在石壁上一撑，翻身落地，轻轻巧巧的落在殷素素身旁。\n" NOR, this_object());
        message_vision(HIR "\n$N凝视着石壁上那三行大字，良久良久，没有作声。\n" NOR, me);
        remove_call_out("shu");
        call_out("shu",4,me);
}
void shu(object me)
{
        message_vision(HIR "\n$N终于叹了一口气，说道：“我写不出，是我输了。”\n"NOR, me);
        message_vision(CYN "$N说道：“请问阁下有何吩咐？”\n"NOR, me);
        me->delete_temp("bizhang");
        me->set_temp("shu",1);
        remove_call_out("end");
        call_out("end",5,me);
}
void end(object me)
{
        object ding,dao;
        object obj = present("yin susu");
        command("say 既是我胜了，就请饶了一干人的性命。");
        command("say 走吧");
        me->delete_temp("biwu");
        ding = present("ding", environment());
        if (! objectp(ding)) return;
        dao = present("tulong blade", ding);
        if (! objectp(dao)) return;
        if (objectp(dao))
        {
                command("rumor "+me->name(1)+"在王盘山击败了各路英豪，夺得了屠龙宝刀。");
                if (! me->query("guan/王盘扬刀威名扬"))
                {
                        me->add("combat_exp", 20000);
                        me->add("potential", 500);
                        me->add("weiwang", 10000);
                        me->add("score", 5000);
                }
                me->set("guan/王盘扬刀威名扬", 1);
                dao->move(me, 1);
        }
        tell_object(me,HIW"\n你得到了屠龙宝刀！\n\n");
        message_vision(HIC"\n$N和$n等三人上船，扬帆而去。\n"NOR,me,this_object());
        if (objectp(obj)) obj->move("/d/tulong/tulong/boat");
        this_object()->move("/d/tulong/tulong/boat");
        me->move("/d/tulong/tulong/boat");
        remove_call_out("storm");
        call_out("storm",random(30),me);
}
void storm(object me)
{
        message_vision(HIB "\n突然之间，$N身子一侧，滚了几个转身，只听得疾风呼啸，\n" NOR,this_object());
        message_vision(HIB "波浪轰击之声，似乎千百个巨浪同时袭到。\n" NOR,this_object());
        remove_call_out("storm2");
        call_out("storm2",4,me);
}
void storm2(object me)
{
        message_vision(HIB "\n脚底下舱板斗然间向左侧去，船中的海水又向外倒泻，\n" NOR,this_object());
        message_vision(HIB "但听得狂风呼啸，身周尽是海水。\n" NOR,this_object());
        remove_call_out("storm3");
        call_out("storm3",4,me);
}
void storm3(object me)
{
        message_vision(HIB "\n天上乌云慢慢散开，露出星夜之光。\n" NOR,this_object());
        message_vision(HIB"\n船慢慢地向东向北飘流。\n"NOR,this_object());
        remove_call_out("storm4");
        call_out("storm4",4,me);
}
void storm4(object me)
{
        message_vision(HIB "\n船慢慢地向东向北飘流。\n" NOR,this_object());
        remove_call_out("storm5");
        call_out("storm5",4,me);
}
void storm5(object me)
{
        message_vision(HIB "\n船慢慢地向东向北飘流。\n" NOR,this_object());
        remove_call_out("storm6");
        call_out("storm6",4,me);
}
void storm6(object me)
{
        message_vision(HIB "\n船慢慢地向东向北飘流。\n" NOR,this_object());
        remove_call_out("arrive");
        call_out("arrive",4,me);
}
void arrive(object me)
{
        object obj = present("yin susu");
        message_vision(HIY "只见正北方一条大船向这方驶来，看来回到中原了。\n" NOR,this_object());
        message_vision(CYN "张翠山抱拳说道：咱们就此别过，后会有期。\n" NOR,me,this_object());
        if (objectp(obj)) obj->move("/d/tulong/tulong/boat3");
        this_object()->move("/d/tulong/tulong/boat3");
        me->move("/d/tulong/tulong/boat3");
}
void init()
{
       add_action("do_get", "get");
}
int do_get(string arg)
{
//     object obj,env,ding;
       string what,where;
       if(!arg)
       return 0;
       if(sscanf(arg,"%s from %s",what, where) !=2)
       return 0;
       if(objectp(present("mai jing", environment())) || objectp(present("guo sanquan",environment())))
       return 0;
       if(where == "ding")
       {
              message_vision(CYN "$N说道：在下武当张翠山，这厢有理了！\n" NOR,
                                 this_object());
              this_player()->delete_temp("bizhang");
              begin(this_player());
              return 1;
       }
       return 0;
}
