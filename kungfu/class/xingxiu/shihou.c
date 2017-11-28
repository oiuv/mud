inherit NPC;

#include "xingxiu.h"

string ask_me();

void create()
{
        set_name("狮吼子", ({ "shihou zi", "shihou" }));
        set("nickname", "星宿派二师兄");
        set("long", 
                "他就是丁春秋的二弟子狮吼子。\n"
                "他三十多岁，狮鼻阔口，一望而知不是中土人士。\n");
        set("gender", "男性");
        set("age", 32);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("class", "fighter");
        set("str", 28);
        set("int", 20);
        set("con", 26);
        set("dex", 22);
        
        set("max_qi", 2500);
        set("max_jing", 1200);
        set("neili", 2800);
        set("max_neili", 2800);
        set("jiali", 25);
        set("combat_exp", 220000);

        set_skill("force", 120);
        set_skill("huagong-dafa", 120);
        set_skill("guixi-gong", 140);
        set_skill("dodge", 90);
        set_skill("zhaixing-gong", 90);
        set_skill("strike", 120);
        set_skill("chousui-zhang", 120);
        set_skill("claw", 100);
        set_skill("sanyin-wugongzhao", 100);
        set_skill("parry", 100);
        set_skill("poison", 80);
        set_skill("staff", 50);
        set_skill("tianshan-zhang", 50);

        set("no_teach", ([
                "huagong-dafa" : "化功大法要老仙亲自传授。",
        ]));

        map_skill("force", "huagong-dafa");
        map_skill("dodge", "zhaixinggong");
        map_skill("claw", "sanyin-wugongzhao");
        map_skill("strike", "chousui-zhang");
        map_skill("parry", "tianshan-zhang");
        map_skill("staff", "tianshan-zhang");

        prepare_skill("strike", "chousui-zhang");
        prepare_skill("claw", "sanyin-wugongzhao");

        create_family("星宿派", 2, "弟子");

        setup();
}

void attempt_apprentice(object ob)
{
        command("say 我不收徒！");
        return 0;

        command("say 好吧，我就收下你了。");
        welcome(ob);
        command("recruit " + ob->query("id"));
}
