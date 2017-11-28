#include <ansi.h>
#include "xueshan.h"
#include "tobebonze.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
        set_name("葛伦布", ({ "ge lunbu", "ge", "lunbu" }));
        set("long", @LONG
葛伦布是大轮寺护寺僧兵的头领。同时向本寺
第子传授武功。身穿一件黑色袈裟，头带僧帽。
LONG);
        set("title", "大轮寺僧兵头领");
        set("gender", "男性");
        set("class", "bonze");
        set("age", 30);
        set("attitude", "heroism");
        set("shen_type", -1);

        set("str", 30);
        set("int", 20);
        set("con", 28);
        set("dex", 25);

        set("max_qi", 3000);
        set("max_jing", 2000);
        set("neili", 2500);
        set("max_neili", 2500);
        set("jiali", 80);
        set("combat_exp", 300000);

        set_skill("force", 120);
        set_skill("mizong-neigong", 120);
        set_skill("dodge", 120);
        set_skill("shenkong-xing", 120);
        set_skill("hammer", 140);
        set_skill("dali-chu", 140);
        set_skill("hand", 120);
        set_skill("dashou-yin", 120);
        set_skill("cuff", 120);
        set_skill("yujiamu-quan", 120);
        set_skill("parry", 120);
        set_skill("lamaism", 100);
        set_skill("literate", 80);
        set_skill("sanscrit", 200);
        set_skill("martial-cognize", 100);

        map_skill("force", "mizong-neigong");
        map_skill("dodge", "shenkong-xing");
        map_skill("parry", "dali-chu");
        map_skill("hammer", "dali-chu");
        map_skill("hand", "dashou-yin");
        map_skill("cuff", "yujiamu-quan");

        prepare_skill("cuff", "yujiamu-quan");
        prepare_skill("hand", "dashou-yin");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "hammer.hong" :),
                (: perform_action, "hand.yin" :),
                (: perform_action, "cuff.jiang" :),
                (: exert_function, "recover" :),
        }));

        create_family("大轮寺", 3, "喇嘛");

        set("inquiry",([
                "剃度" : (: ask_for_join :),
                "出家" : (: ask_for_join :),
        ]));

        set("coagents", ({
                ([ "startroom" : "/d/xueshan/neidian",
                   "id"        : "jinlun fawang", ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "冷喝道："
                                "你给我站住！我们大轮寺岂是由得外"
                                "人随便走动地方？" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背上背的是什么人？还不快给我放下"
                                "来！" NOR,
        ]));

        setup();

        carry_object("/d/xueshan/obj/b-jiasha")->wear();
        carry_object("/d/xueshan/obj/sengmao")->wear();
        carry_object("/d/xueshan/obj/gangchu")->wield();
        add_money("silver", 10);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;
 
        if ((string)ob->query("gender") != "男性")
        {
                command("say 修习密宗内功需要纯阳之体。");
                command("say 这位" + RANK_D->query_respect(ob) + "还是请"
                        "回吧！");
                return;
        }

        command("say 既然你有心习武，我就传你一些武功吧！");
        if ((string)ob->query("class") != "bonze")
	{
                command("say 若你打算入寺修行上层武功，却非得先" HIY "剃"
                        "度" NOR + CYN "不可。" NOR);
                ob->set("title", "雪山派俗家弟子");
	}
        command("recruit " + ob->query("id"));
}
