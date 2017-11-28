// yu.c

inherit NPC;

void create()
{
        set_name("余沧海", ({ "yu canghai", "yu", "canghai" }));
        set("gender", "男性");
        set("age", 52);
        set("long", "他身形矮小，可是神情凝重，俨然一派大宗师气。\n");
        set("class", "taoist");

        set("combat_exp", 800000);
        set("shen_type", -1);

        set_skill("sword", 80);
        set_skill("pixie-sword", 80);
        set_skill("unarmed", 80);
        set_skill("dodge", 80);
        set_skill("parry", 80);
        map_skill("parry", "pixie-sword");
        map_skill("sword", "pixie-sword");
        create_family("青城派", 7, "掌门");
        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/wudang/obj/bluecloth")->wear();
}


