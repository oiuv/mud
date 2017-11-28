// yuzhenzi.c

#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;

void create()
{
        set_name("玉真子", ({ "yuzhen zi", "yuzhen" }));
        set("gender", "男性");
        set("title", "铁剑门掌门人");
        set("nickname", HIC"护国真人"NOR);
        set("age", 44);
        set("long", "这是一位颇有仙风道骨的潇洒全真，手握长剑，目视前方。\n");

        set("str", 25);
        set("int", 27);
        set("con", 23);
        set("dex", 28);

        set("qi", 3000);
        set("max_qi", 3000);
        set("jing", 1500);
        set("max_jing", 1500);
        set("neili", 3500); 
        set("max_neili", 3500);
        set("jiali", 60);
        set("combat_exp", 600000);
        set("shen_type", -1);
        set("attitude", "peaceful");

        set_skill("sword", 150);
        set_skill("force", 150);
        set_skill("mizong-neigong", 150);
        set_skill("unarmed", 150);
        set_skill("dodge", 150);
        set_skill("parry", 150);
        set_skill("huashan-jian", 150);
        set_skill("shenxing-baibian", 150);
        map_skill("whip",  "huashan-jian");
        map_skill("parry", "huashan-jian");
        map_skill("dodge", "shenxing-baibian");

        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 1);
}

