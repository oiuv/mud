inherit NPC;

#include "xingxiu.h"

string ask_me();

void create()
{
        set_name("天狼子", ({ "tianlang zi", "tianlang" }));
        set("nickname", "星宿派三师兄");
        set("long", 
                "他就是丁春秋的三弟子天狼子。\n");
        set("gender", "男性");
        set("age", 30);
        set("attitude", "peaceful");
        set("class", "fighter");
        set("shen_type", -1);
        set("str", 27);
        set("int", 16);
        set("con", 25);
        set("dex", 27);
        
        set("max_qi", 1700);
        set("max_jing", 800);
        set("neili", 1900);
        set("max_neili", 1900);
        set("jiali", 15);
        set("combat_exp", 120000);

        set_skill("force", 100);
        set_skill("huagong-dafa", 100);
        set_skill("guixi-gong", 100);
        set_skill("dodge", 70);
        set_skill("zhaixing-gong", 70);
        set_skill("strike", 70);
        set_skill("chousui-zhang", 70);
        set_skill("claw", 100);
        set_skill("sanyin-wugongzhao", 100);
        set_skill("whip", 60);
        set_skill("chanhun-suo", 60);
        set_skill("parry", 100);
        set_skill("poison", 70);
        set_skill("staff", 50);
        set_skill("tianshan-zhang", 50);

        set("no_teach", ([
                "huagong-dafa" : "化功大法要老仙亲自传授。",
        ]));

        map_skill("whip", "chanhun-suo");
        map_skill("force", "huagong-dafa");
        map_skill("dodge", "zhaixinggong");
        map_skill("strike", "chousui-zhang");
        map_skill("claw", "sanyin-wugongzhao");
        map_skill("parry", "tianshan-zhang");
        map_skill("staff", "tianshan-zhang");

        prepare_skill("strike", "chousui-zhang");
        prepare_skill("claw", "sanyin-wugongzhao");

        create_family("星宿派", 2, "弟子");

        setup();
}

void attempt_apprentice(object ob)
{
        command("say 我不收徒。");
        return 0;

        command("say 好吧，我就收下你了。");
        welcome(ob);
        command("recruit " + ob->query("id"));
}

