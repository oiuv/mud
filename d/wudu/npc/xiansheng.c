#include <ansi.h> 
inherit NPC;

void create()
{
        set_name("教书先生", ({ "xian sheng","xian" }) );
        set("gender", "男性" );
        set("age", 40);
        set("per", 30);
        set("long", "一位白面无须的中年文士，正摇头晃脑的在教学生念书。\n");
        set("combat_exp", 1000);
        set("attitude", "friendly");
        set_skill("dodge", 15);
        set_skill("unarmed", 10);
        set_skill("parry", 15);
        set("max_qi", 400);

        set("chat_chance", 10);
        set("chat_msg", ({
                CYN "教书先生念道：人之初，性本善。\n" NOR,
                CYN "教书先生摇头晃脑的吟道：关关雎鸠，在河之洲，窈窕淑女，君子好逑。\n" NOR,
                CYN "教书先生自言自语道：挠挠痒痒，痒痒挠挠，不挠不痒，不痒不挠。\n" NOR,
                CYN "教书先生朗声念道：春眠不觉晓，处处闻啼鸟。\n" NOR,
        }));

        setup();
        add_money("silver", 5);

        carry_object("/d/city/obj/cloth")->wear();
}
