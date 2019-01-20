#include <ansi.h>

inherit NPC;

void create()
{
        set_name("麦鲸", ({ "mai jing", "mai", "jing" }) );
        set("long",
                  "这是巨鲸帮帮主麦鲸，身高七尺，满面\n扎须，相貌很是威猛。\n");
        set("attitude", "heroism");
        set("title", WHT "巨鲸帮帮主" NOR);
        set("age", 47);
        set("combat_exp", 800000);
        set("max_neili", 1500+random(1000));
 
        set_skill("unarmed", 100+random(50));
        set_skill("parry", 100+random(50));
        set_skill("dodge", 100+random(50));
        set_skill("force", 100+random(50));

        set("max_qi", 2500+random(1000)); 
        set("max_jing", 2500+random(1000)); 


        setup();

        carry_object("/d/beijing/npc/obj/cloth6")->wear();
}

int accept_fight(object who)
{
        command("say 我不和你蛮打，只和你比(bi)一些水上功夫。");
        return 0;
}

int accept_hit(object who)
{
        command("say 我不和你蛮打，只和你比(bi)一些水上功夫。");
        return 0;
}

int accept_kill(object who)
{
        command("say 怎么，想得屠龙刀就非得要行凶不成？");
	return 1;
}

int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见会场里黑压压的挤满了人，根本看不清楚。\n");
}

int begin()
{
        object me=this_player();
        if (objectp(present("yuan guangbo",environment()))) 
        return 0;

        command("nod");
        command("say 我巨鲸帮的绝技，乃是使用水上功夫。");
        command("say 如今你我各用湿泥糊嘴，比试一下水上功夫，如何？");

        message_vision(HIW "$n和$N各取湿泥，糊上口鼻。\n" NOR,
                           this_object(),me);
        me->set_temp("bi",1);
        set("anti",me);
        me->apply_condition("nishui",random(4)+1);
        this_object()->apply_condition("nishui",random(10)+10);
        call_out("guo",6,me);
        return 1;
}

void die()
{
        if (objectp(query("anti")))
        {
                message_vision(HIR"\n\n$N挣扎了两下，一口气没接上，倒在地上一动不动了。\n"NOR,this_object());
                query("anti")->set_temp("win_mai",1);
                query("anti")->delete_temp("bi");
                query("anti")->apply_condition("nishui",0);
        }
::die();
}

void unconcious()
{
        if (objectp(query("anti")))
        {
                message_vision(HIR"\n\n$N挣扎了两下，一口气没接上，倒在地上一动不动了。\n"NOR,this_object());
                query("anti")->set_temp("win_mai",1);
                query("anti")->delete_temp("bi");
                query("anti")->apply_condition("nishui",0);
        }
::die();
}

void guo(object me)
{
        if (objectp(present("guo sanquan",environment()))) present("guo sanquan",environment())->begin(me);
}

void init()
{
        add_action("do_get","get");
        add_action("begin","bi");
}

int do_get(string arg)
{
        object obj/*,env,ding*/;
        string what,where;

        if(!arg) 
        return 0;

        if (objectp(obj=present("yuan guangbo",environment()))) 
        return 0;

        if(sscanf(arg,"%s from %s",what, where) !=2)
        return 0;

        obj=this_object();
        if(where == "ding")
        {
                message_vision(CYN "$N正色道：这位英雄请了！\n" NOR,
                                   obj);

                message_vision(CYN "$N说道：屠龙宝刀乃不世之宝，要得此刀，需过(bi)了我这关！\n" NOR,
                                   obj);

                this_player()->delete_temp("bi");
                return 1;
        }
        return 0;
}
