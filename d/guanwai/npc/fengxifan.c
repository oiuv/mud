// fengxifan.c
inherit NPC;
inherit F_MASTER;
#include <ansi.h>

void create()
{
        set_name("冯锡范", ({ "feng xifan", "feng" }) );
        set("nickname", HIR"一剑无血"NOR);
        set("gender", "男性");
        set("class", "swordsman");
        set("age", 45);
        set("long",
                "冯锡范是延平王府卫队长，武夷派第一高手，一张白湛湛的面皮。\n");
        set("attitude", "peaceful");
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        set("neili", 2400);
        set("max_neili", 2400);
        set("jiali", 30);
        set("max_qi",2000);
        set("max_jing",1200);

        set("combat_exp", 1500000);
        set("shen_type", -1);
        set("apprentice_available", 3);

        set_skill("unarmed", 190);
        set_skill("sword", 220);
        set_skill("force", 190);
        set_skill("parry", 190);
        set_skill("dodge", 210);
        set_skill("strike", 190);
        set_skill("literate", 100);
        set_skill("huashan-jian", 220);
        set_skill("kuangfeng-jian", 220);
        set_skill("huashan-xinfa", 190);
        set_skill("huashan-zhangfa", 190);
        set_skill("huashan-quanfa", 190);
        set_skill("huashan-shenfa", 190);

        map_skill("sword", "kuangfeng-jian");
        map_skill("parry", "kuangfeng-jian");
        map_skill("force", "huashan-xinfa");
        map_skill("unarmed", "huashan-quanfa");
        map_skill("strike", "huashan-zhangfa");
        map_skill("dodge", "huashan-shenfa");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}
