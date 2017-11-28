#include <ansi.h>
inherit NPC;

void create()
{
        set_name("萧湘子", ({ "xiao xiangzi", "xiao" }));
        set("long", "萧湘先生被称为当世第二大文学家，肚子里的墨水比海还要深。\n");
        set("gender", "男性");
        set("age", 45);

        set_skill("literate", 300);
        set_skill("taoism", 300);

        set_skill("unarmed", 80);
        set_skill("dodge", 80);
        set_skill("parry", 80);
        set_temp("apply/attack", 80);
        set_temp("apply/defense", 80);
        set_temp("apply/damage", 20);

        set("combat_exp", 400000);
        set("shen_type", 1);
        setup();

        set("chat_chance", 3);
        set("chat_msg", ({
                CYN "萧湘子说道：普天之下，莫非王土；率土之滨，莫非王臣。\n" NOR,
                CYN "萧湘子说道：出家人，小过损益焉；无妄大过，未济咸困之。\n" NOR,
                CYN "萧湘子说道：大学之道，在明明德。在亲民，在止于至善。 \n" NOR,
                CYN "萧湘子说道：格物致知，诚意正心，修身齐家，治国平天下。\n" NOR,
        }) );
        carry_object("/clone/misc/cloth")->wear();
}
