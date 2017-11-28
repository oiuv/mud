// shen.c

inherit NPC;

void create()
{
        set_name("申人俊", ({ "shen renjun", "shen", "renjun" }));
        set("gender", "男性");
        set("age", 25);
        set("long", "他就是和吉人通焦孟不离的申人俊。\n");

        set("combat_exp", 70000);
        set("shen_type", -1);

        set_skill("sword", 70);
        set_skill("pixie-sword", 70);
        set_skill("unarmed", 70);
        set_skill("dodge", 70);
        set_skill("parry", 70);
        map_skill("parry", "pixie-sword");
        map_skill("sword", "pixie-sword");
        create_family("青城派", 6, "弟子");
        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/wudang/obj/bluecloth")->wear();
}

