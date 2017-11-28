// modify by rcwiz!

inherit NPC;

#include <ansi.h>

void init();

string give_gift();

void create()
{
	set_name(HIR "圣诞" HIW "老人" NOR, ({ "christmas man", "man", "lao ren" }) );
	set("gender", "男性" );
	set("age", 65);
	set("long", HIM "圣诞老人背着一个大口袋，笑嘻嘻地看着你！\n" NOR);
	set("shen_type", -1);
	set("combat_exp", 10000);
	set("str", 80);
	set("dex", 82);
	set("con", 80);
	set("int", 81);

        set("max_qi", 30000);
        set("max_jing", 18000);
        set("neili", 32000);
        set("max_neili", 32000);
        set("jiali", 550);
        set("combat_exp", 15000000);
        set("score", 100000);

        set_skill("force", 600);
        set_skill("kuihua-mogong", 600);
        set_skill("dodge", 600);
        set_skill("unarmed", 600);
        set_skill("parry", 600);
        set_skill("literate", 600);
        set_skill("martial-cognize", 460);

        map_skill("force", "kuihua-mogong");
        map_skill("dodge", "kuihua-mogong");
        map_skill("unarmed", "kuihua-mogong");
        map_skill("parry", "kuihua-mogong");

        prepare_skill("unarmed", "kuihua-mogong");

        set("inquiry", ([
                "圣诞快乐" : (: give_gift :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.tian" :),
                (: perform_action, "unarmed.qiong" :),
                (: perform_action, "unarmed.bian" :),
                (: perform_action, "unarmed.sheng" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
        }));

	set("attitude", "friendly");
	setup();

	carry_object(__DIR__"ccloth")->wear();

	add_money("silver", 3);
}

void init()
{
        command("say 圣诞快乐！Merry Christmas！");
}

string give_gift()
{
        object me;
        object gift;
        me = this_player();
    
        // 已经领取过礼物
        if (me->query("get_christmas_gift/y2002"))
                 return HIR "圣诞" HIW "老人" HIR " 笑嘻嘻地对你说道：“Merry Christmas！”\n" NOR;
        
        // 已经吃过礼物
        if (me->query("eat_christmas_gift/y2002"))
                 return HIR "圣诞" HIW "老人" HIR "笑嘻嘻地对你说道：“Merry Christmas！”\n" NOR;

        // 给予礼物
        message_vision(HIY "圣诞老人笑嘻嘻地对$N说道：“Merry Christmas！”\n" NOR, me);
        command("smile");
        command("say 恩，我给你找找礼物！你等等！");
        message_vision(HIY "圣诞老人将背上的大口袋放在地方，翻来翻去……\n", me);
        command("haha");
        command("say 好了，你的礼物，给你吧！");
        message_vision(HIY "圣诞老人将礼物给$N" HIY "\n", me);        
        tell_object(me, HIG "你得到了一个礼物，快看看吧！\n");
        
        switch(random(5))
        {
             case 1 :
                  gift = new(__DIR__"jitui");
                  gift->move(me);

             case 2 :
                  gift = new(__DIR__"hanbao");
                  gift->move(me);
 
             case 3 :                  
                  gift = new(__DIR__"dabing");
                  gift->move(me);

             default :
                  gift = new(__DIR__"chang");
                  gift->move(me);

        }        
        me->set("get_christmas_gift/y2002", 1);
        return "Bye！\n";
          
}


