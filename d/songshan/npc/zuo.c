// zuo.c
inherit NPC;

#include <ansi.h>

void create()
{
        set_name("左冷禅", ({ "zuo lengchan", "zuo" }) );
        set("title", HIR"五岳剑派盟主"HIY"嵩山派第十三掌门"NOR);
        set("gender", "男性");
        set("class", "swordsman");
        set("age", 55);
        set("attitude", "peaceful");
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        set("max_qi",4500);
        set("max_jing",2200);
        set("neili", 4800);
        set("max_neili", 4800);
        set("jiali", 80);
        set("combat_exp", 1850000);
        set("shen_type", -1);

        set_skill("sword", 210);
        set_skill("force", 220);
        set_skill("parry", 180);
        set_skill("dodge", 180);
        set_skill("strike", 200);
        set_skill("songshan-xinfa", 220);
        set_skill("songshan-sword", 210);
        set_skill("lingxu-bu", 180);
        set_skill("hanbing-mianzhang", 200);

        map_skill("force", "songshan-xinfa");
        map_skill("sword", "songshan-sword");
        map_skill("parry", "songshan-sword");
        map_skill("strike", "hanbing-mianzhang");
        map_skill("dodge", "lingxu-bu");

        prepare_skill("strike", "hanbing-mianzhang");

        create_family("嵩山派", 13, "掌门");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}
