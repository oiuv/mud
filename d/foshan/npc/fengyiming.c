inherit NPC;

void create()
{
        set_name("凤一鸣", ({ "feng yiming", "feng", "yiming" }));
        set("long", @LONG
凤一鸣是佛山镇上大财主凤天南之子。只见他
步履轻捷，脸上英气勃勃，显是武功不弱。
LONG);
        set("title", "佛山五虎门传人");
        set("gender", "男性");
        set("age", 25);
        set("combat_exp", 40000);
        set_skill("unarmed", 50);
        set_skill("force", 60);
        set_skill("blade", 80);
        set_skill("dodge", 50);
        set_skill("parry", 50);

        set_temp("apply/attack", 30);
        set_temp("apply/defense", 30);
        set_temp("apply/armor", 5);
        set_temp("apply/damage", 10);
        setup();

        carry_object("/d/city/npc/cloth/fu-cloth")->wear();
        carry_object("/d/city/npc/cloth/jade-belt")->wear();
}
