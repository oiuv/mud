inherit NPC;

void create()
{
    set_name("猴子", ({ "monkey" }) );
    set("gender", "雄性");
    set("race", "野兽");
    set("age", 5);
    set("long",
        "这只猴子在在桃树间跳上跳下，还不时津津有味地啃几口着蜜桃。\n");
    set("combat_exp", 5000);
    set("shen_type", -1);
    set("attitude", "peaceful");
    set("limbs", ({ "猴嘴", "前爪", "后爪", "尾巴" }) );
    set("verbs", ({ "bite", "claw" }) );

    set("water", 200);
    set("food", 200);

    set("apply/attack", 10);
    set("apply/defense", 10);

    set_skill("unarmed", 25);
    set_skill("parry", 20);
    set_skill("dodge", 20);

    setup();
}
