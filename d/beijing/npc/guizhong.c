inherit NPC;
#include <ansi.h>

void create()
{
        set_name("归钟", ({ "gui zhong", "gui" }));
        set("title", "归辛树之子");
        set("long", "一个痨病鬼，不住的咳嗽，神情却又犹如小孩子一\n"
                    "般，他便是归辛树之子—归钟，从小便体弱多病。\n");
        set("gender", "男性");
        set("age", 34);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 30);
        set("int", 20);
        set("con", 20);
        set("dex", 20);
        set("per", 10);
        
        set("qi", 2000);
        set("max_qi", 2000);
        set("jing", 1000);
        set("max_jing", 1000);
        set("neili", 1000);
        set("max_neili", 1000);
        set("jiali", 50);

        set("combat_exp", 500000);
        set("score", 20000);

        set_skill("cuff", 120);
        set_skill("force", 80);
        set_skill("dodge", 80);
        set_skill("parry", 80);
        set_skill("strike", 120);
        set_skill("zixia-shengong", 80);
        set_skill("poyu-quan", 120);
        set_skill("hunyuan-zhang", 120);
        set_skill("feiyan-huixiang",80);

        map_skill("cuff", "poyu-quan");
        map_skill("force", "zixia-shengong");
        map_skill("dodge", "feiyan-huixiang");
        map_skill("parry", "poyu-quan");
        map_skill("strike", "hunyuan-zhang");

        prepare_skill("strike", "hunyuan-zhang");
        prepare_skill("cuff", "poyu-quan");

        set("chat_chance", 20);
        set("chat_msg", ({
                CYN "归钟轻轻地咳嗽了几声。\n" NOR,
                CYN "归钟咳嗽了几声，一张脸涨得通红。\n" NOR,
        }) );       


        create_family("华山派", 32, "弟子");

        set("chat_chance_combat", 60);
        set("chat_msg_combat", ({
                (: exert_function, "recover" :),
        }) );

        setup();
        carry_object("/d/beijing/npc/obj/hupi")->wear();
}

void kill_ob (object ob)
{
  	object me = this_object();
  	object where = environment (me);
  	object guard = present ("gui erniang", where);

  	set_temp("my_killer",ob);
  	::kill_ob(ob);
  	if (guard && !guard->is_fighting())
   	{
        	message_vision (HIR "$N" HIR "大怒：阁下欺人太"
                                "甚，别怪我无情！\n" NOR, guard);
        	guard->kill_ob(ob);
   	}
}
