#include <ansi.h>
inherit NPC;
void create()
{
        set_name("元广波", ({ "yuan guangbo", "yuan", "guangbo" }) );
        set("long", "这是海沙派总舵主元广波，目光如电，身材彪捍。\n");
        set("attitude", "heroism");
        set("title", HIY "海沙派总舵主" NOR);
        set("age", 15);

        set("max_neili", 1000+random(500));
        set("combat_exp", 800000);

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
        command("say 我不和你蛮打，只和你比(bi)一些我海沙帮的绝技。");
        return 0;
}

int accept_hit(object who)
{
        command("say 我不和你蛮打，只和你比(bi)一些我海沙帮的绝技。");
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
        if (objectp(present("chang jinpeng",environment())))
        return 0;

        command("grin");        
        command("say 我海沙帮的绝技，乃是使用毒盐害人，如今你我各吃一碗，如何？");

        message_vision(HIW "$N叫手下装了两大碗毒盐，$N和$n各吃一碗。\n" NOR,
                           this_object(),me);

        me->set_temp("bi",1);
        set("anti",me);
        me->apply_condition("duyan",random(4)+1);
        this_object()->apply_condition("duyan",random(10)+10);
        return 1;
}

void die()
{
        if (objectp(query("anti")))
        {
                command("say 佩服，佩服......");
                message_vision(HIR "\n$N嘶哑着嗓子干嚎了两声，双眼翻白，跌倒在地，口中吐出一些白沫，就再也没动了。\n" NOR,
                                   this_object());
                query("anti")->set_temp("win_yuan",1);
                query("anti")->delete_temp("bi");
        }
::die();
}

void unconcious()
{
        if (objectp(query("anti")))
        {
                command("say 佩服，佩服......");
                message_vision(HIR "\n$N嘶哑着嗓子干嚎了两声，双眼翻白，跌倒在地，口中吐出一些白沫，就再也没动了。\n" NOR,
                                   this_object());
                query("anti")->set_temp("win_yuan",1);
                query("anti")->delete_temp("bi");
        }
::die();
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
        if(!arg) return 0;
        if (objectp(obj=present("chang jinpeng",environment(this_object())))) return 0;
        if(sscanf(arg,"%s from %s",what, where) !=2) return 0;
        obj=this_object();

        if(where == "ding")
        {
                message_vision(CYN "$N喝道：无耻小贼，给我住手！你凭什么得此宝刀？\n" NOR,
                                   obj,this_player());

                message_vision(CYN "$N冷冷地说道：要得此刀，先比(bi)赢了我再说！\n" NOR,
                                   obj,this_player());

                this_player()->delete_temp("bi");
                return 1;
        }
        return 0;
}
