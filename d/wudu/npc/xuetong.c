#include <ansi.h> 
inherit NPC;

void create()
{
        set_name("小学童", ({ "xue tong","tong" }) );
        set("gender", "男性" );
        set("age", 14);
        set("per", 30);
        set("long", "这是一个十三四岁的小童，正心不在焉的跟着先生胡乱念着。\n");
        set("combat_exp", 300);
        set("attitude", "friendly");
        set_skill("dodge", 5);
        set_skill("unarmed", 5);
        set_skill("parry", 5);
        set("max_qi", 200);

        set("chat_chance", 10);
        set("chat_msg", ({
                CYN "小学童断断续续的念道：人之初，性本……呼…呼……\n" NOR,
                CYN "小学童摇头晃脑的念道：蝈蝈鸠鸠，在河洲洲，窈窕是你，君子高逑。\n" NOR,
                CYN "小学童自言自语道：生生死死，死死生生，先生先死，先死先生。\n" NOR,
                CYN "小学童随声附和道：春眠不觉晓，所以睡懒觉。\n" NOR,
        }));

        setup();
        add_money("coin", 50);

        carry_object("/d/city/obj/cloth")->wear();
}
