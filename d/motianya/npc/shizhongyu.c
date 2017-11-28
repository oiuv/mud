// shizhongyu.c 石中玉

inherit NPC;

void create()
{
        set_name("石中玉", ({ "shi zhongyu", "shi", "zhongyu" }));
        set("gender", "男性");
        set("age", 20);
        set("str", 15);
        set("int", 45);
        set("con", 18);
        set("dex", 20);
        set("per", 30);
        set("long", "这是一个年轻公子，大约二十左右岁，面若中秋之月，色如春晓
之花，鬓若刀裁，眉如墨画，鼻如悬胆，情若秋波，虽怒而时笑，即视而有情。\n");
        set("combat_exp", 100000);
        set("shen_type", 1);
        set("attitude", "peaceful");

        set_skill("unarmed", 30);
        set_skill("force", 30);
        set_skill("blade", 20);
        set_skill("dodge", 30);
        set_skill("parry", 30);
        set_skill("literate",100);

        set_skill("wuhu-duanmendao", 50);
        set_temp("apply/attack", 30);
        set_temp("apply/defense", 30);
        set_temp("apply/armor", 5);
        set_temp("apply/damage", 10);
        map_skill("blade", "wuhu-duanmendao");

        set("neili", 200);
        set("max_neili", 200);
        set("jiali", 20);
        set("inquiry", ([
                "侠客岛" : "在泉州附近的一个小岛。\n",
                "石破天" : "他...\n",
                "叮当"   : "我好久没见到她了，不知道她现在怎么样了。\n",
        ]) );
        set("chat_chance", 8);
        set("chat_msg", ({
                "\n石中玉说道: 叮当，你在哪呀，我好想你呀。\n",
                "\n石中玉叹道: 也不知道我的叮当怎么样了。\n",
                "\n石中玉说道: 腊八粥可是好东西...\n",
                "\n石中玉说道: 唉，谁能帮我杀了外面的老头，兄弟我谢谢你了！\n",

        }));
        setup();
        carry_object("/clone/weapon/gangdao")->wield();
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 10);
}

void die()
{
        say("\n石中玉说道：我还有个心愿没了，希望你能帮我照顾叮当！\n");

        message_vision("石中玉喊着叮当的名字，死了！\n", this_object());
        ::die();
}
