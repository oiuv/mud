#include <ansi.h>

inherit NPC;

void create()
{
        set_name("赵敏", ({ "zhao min", "min", "zhao"}));
        set("title", HIY "大元绍敏郡主" NOR);
        set("long",
"她脸泛红霞，容色丽都。十分美丽之中，更带着三分英气，三分豪态，同
时雍容华贵，自有一副端严之姿，令人肃然起敬，不敢逼视。\n");
        set("gender", "女性");
        set("age", 15);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 30);
        set("str", 15);
        set("int", 25);
        set("con", 25);
        set("dex", 30);

        set("max_qi", 500);
        set("max_jing", 200);
        set("max_neili", 500);
        set("neili", 500);
        set("jiali", 50);
        set("combat_exp", 50000+random(10000));
        set("score", 20000);
        set("chat_chance_combat", 60);
        set("chat_msg_combat", ({
                (: perform_action, "sword.ren" :),
        }) );

        set_skill("force", 80);
        set_skill("dodge", 80);
        set_skill("unarmed", 80);
        set_skill("sword", 80);
        set_skill("liangyi-jian", 80);
        set_skill("huifeng-jian", 80);
        set_skill("taiji-shengong", 90);
        set_skill("changquan", 80);
        set_skill("lingxu-bu", 80);
        map_skill("dodge", "lingxu-bu");
        map_skill("parry", "liangyi-jian");
        map_skill("sword", "liangyi-jian");
        map_skill("unarmed", "changquan");

        set("inquiry", ([
            "张无忌" :  "张公子远在昆仑，不知他近来可好？秋冷春寒，可有寒衣？\n",
            "倚天剑" :  "倚天为天下神兵，怎么，你想要？\n",
        ]));

        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/female2-cloth")->wear();
}
