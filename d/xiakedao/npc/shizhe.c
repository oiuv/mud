//NPC /npc/shizhe.c

#include <ansi.h>

inherit NPC;

void greeting(object);
void init();

void create()
{
        set_name("黄衣使者", ( { "shi zhe", "zhe" }));
        set("gender", "男性" );
        set("age", 30);
        set("long", "这是个身着黄衣的三十几岁汉子，手持木浆，面无表情。\n");
        set("attitude", "friendly");
        set("shen_type", 1);

        set("str", 30);
        set("int", 39);
        set("con", 30);
        set("dex", 30);

        set("max_qi", 330);
        set("max_jing", 320);
        set("neili", 300);
        set("max_neili", 300);

        set("combat_exp", 16000);

        set_skill("force", 50);
        set_skill("dodge", 50);
        set_skill("unarmed", 50);
        set_skill("parry", 50);
        set_temp("apply/attack", 50);
        set_temp("apply/defense", 50);
        set_temp("apply/damage", 50);
        set_temp("apply/armor", 50);

        set_temp("ling", 0);
        set_temp("times", 5);
        create_family("侠客岛", 0, "弟子");

        set("inquiry", ([
                "出海"   : "南边还有几艘船，你自己看看去吧！\n",
        ]));
        setup();
}
