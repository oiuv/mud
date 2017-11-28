#include <ansi.h>
inherit NPC;

int ask_me();

void create()
{
        set_name("毒道人", ({ "du daoren", "daoren" }));
        set("gender", "男性" );
        set("age", 35);
        set("per", 20);
        set("long", "一位身穿道服，干瘪黑瘦的中年道人．\n");
        set("combat_exp", 200000);
        set("attitude", "friendly");
        set("book_count", 1);

        set_skill("blade", 50);
        set_skill("ruyi-dao", 50);
        set_skill("force", 50);
        set_skill("dodge", 50);
        set_skill("unarmed", 50);
        set_skill("parry", 50);
        set_skill("feiyan-zoubi", 50);
        set_skill("beiming-shengong",50);
        set_skill("changquan", 50);

        map_skill("unarmed", "changquan");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("force", "beiming-shengong");
        map_skill("blade", "ruyi-dao");

        set("title", "五毒教小头目");

        set("chat_chance", 2);
        set("chat_msg",({
                CYN "毒道人冷笑道：江湖中人谁敢和我们五毒教作对，管叫"
                "他死的不明不白。\n" NOR,
                CYN "毒道人干笑一声道：贫道专管练制各种毒药，保证药到"
                "命除。\n" NOR,
        }));

        setup();
        add_money("silver", 20);
        set("inquiry", ([
                "here"     : "此乃炼丹房，可以在这里练制(lianzhi)各种毒药。",
                "毒药"     : "阁下可以在这里练制(lianzhi)各种毒药。",
                "原料"     : (: ask_me :),
                "练毒"     : (: ask_me :),
                "毒经"     : "你打算炼毒么？可惜我这里只有毒经上篇。",
                "上篇"     : (: ask_me :),
                "毒经上篇" : (: ask_me :),
                "配方"     : (: ask_me :),
                "毒药配方" : (: ask_me :),
        ]) );
        carry_object("/d/wudang/obj/greenrobe")->wear();
}

int ask_me()
{
        object ob, me;
        me = this_player();

        if (me->query("family/family_name") != "五毒教")
        {
                command("say 阁下与本派并无渊源，这话是从何而来？");
                return 1;
        }

        if (query("book_count") < 1)
        {
                command("say 你来晚了，毒经我已经给别人了。");
                return 1;
        }
        add("book_count", -1);
        ob = new("/d/wudu/obj/dujing1");
        ob->move(this_object());

        command("say 此毒经上记载了各种密药的练制方法，千万不可遗失了。");
        command("give du jing1 to " + me->query("id"));
        return 1;
}
