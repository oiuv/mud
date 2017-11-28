inherit NPC;
inherit F_MASTER;

#include <command.h>
#include <ansi.h>
#include "emei.h"

void create()
{
        set_name("周芷若", ({ "zhou zhiruo","zhiruo","zhou"}));
        set("long", "她是峨嵋派的第四代掌门弟子。只见她一张\n"
                    "脸秀丽绝俗。身着一身淡黄衣裳。略显清减\n"
                    "的巧笑中带了些许无奈。\n");
        set("gender", "女性");
        set("age", 20);
        set("attitude", "peaceful");
        set("shen_type", 1);

        set("inquiry",([
                "剃度"     : "找我剃度？不对吧。",
                "出家"     : "要出家找我的师姐们去。",
                "还俗"     : "无聊。还俗也找我！",
                "张无忌"   : "这个狠心短命的家伙，我再也不要见她！",
                "赵敏"     : "不要问这个贱婢子！",
                "倚天剑"   : "倚天不出，谁与争锋？唉！",
                "屠龙刀"   : "你想武林称雄？别做梦了。",
                "灭绝师太" : "师父待我恩重如山，我今生难以回报。",
                "九阴真经" : "那是什么东西？我这可是第一次听说。",
        ]));

        set("str", 22);
        set("int", 32);
        set("con", 26);
        set("dex", 24);

        set("max_qi", 5000);
        set("max_jing", 3000);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jingli", 2000);
        set("max_jingli", 2000);
        set("jiali", 200);
        set("combat_exp", 2500000);

        set_skill("force", 260);
        set_skill("emei-xinfa", 180);
        set_skill("yijin-duangu", 260);      // 易筋锻骨
        set_skill("linji-zhuang", 200);
        set_skill("dodge", 260);
        set_skill("shexing-lifan", 260);     // 蛇行狸翻
        set_skill("zhutian-bu", 180);
        set_skill("finger", 180);
        set_skill("tiangang-zhi", 180);
        set_skill("hand", 180);
        set_skill("jieshou-jiushi", 180);
        set_skill("strike", 260);
        set_skill("jinding-zhang", 180);
        set_skill("sixiang-zhang", 180);
        set_skill("cuixin-zhang", 260);      // 催心掌
        set_skill("claw", 260);
        set_skill("jiuyin-baiguzhao", 260);  // 九阴白骨爪
        set_skill("whip", 260);
        set_skill("yinlong-bian", 260);      // 银龙鞭法
        set_skill("sword", 180);
        set_skill("emei-jian", 180);
        set_skill("yitian-jian", 180);
        set_skill("blade", 180);
        set_skill("yanxing-dao", 180);
        set_skill("parry", 260);
        set_skill("martial-cognize", 200);
        set_skill("literate", 200);
        set_skill("mahayana", 100);
        set_skill("buddhism", 100);

        map_skill("force", "yijin-duangu");
        map_skill("dodge", "shexing-lifan");
        map_skill("finger", "tiangang-zhi");
        map_skill("hand", "jieshou-jiushi");
        map_skill("strike", "cuixin-zhang");
        map_skill("claw", "jiuyin-baiguzhao");
        map_skill("whip", "yinlong-bian");
        map_skill("sword", "yitian-jian");
        map_skill("blade", "yanxing-dao");
        map_skill("parry", "yinlong-bian");

        prepare_skill("strike", "cuixin-zhang");
        prepare_skill("claw", "jiuyin-baiguzhao");

        create_family("峨嵋派", 4, "掌门弟子");

        set("no_teach", ([
                "linji-zhuang"     : "想学临济十二庄找我师父去。",
                "shexing-lifan"    : "蛇行狸翻？这也是种武功吗？听名字倒是蛮有意思的。",
                "yijin-duangu"     : "你说的那是什么啊？我这可是头一次听说。",
                "cuixin-zhang"     : "催心掌？听名字怪吓人的，这样的武功我可不会。",
                "jiuyin-baiguzhao" : "九阴白骨爪？这是什么武功啊？光听名字我就毛骨悚然。",
                "yinlong-bian"     : "我只会剑法和刀法，鞭法师父从来没教过我。",
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "claw.duo" :),       // 夺命连环
                (: perform_action, "claw.jie" :),       // 九阴刹神抓
                (: perform_action, "strike.cuixin" :),  // 催心破元诀
                (: perform_action, "whip.jiao" :),      // 天诛龙蛟诀
                (: perform_action, "dodge.guiyuan" :),  // 九阴归元劲
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
        }));

        setup();
//        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/city/npc/cloth/sha-dress")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query_int() < 45)
        {
                command("say 这位" + RANK_D->query_respect(ob) + "恐怕资质差了一点。");
                command("say 不过尚大有潜力，还是先回去磨练磨练。");
                return;
        }

        command("say " + ob->query("name") + "看你这么可怜，勉为其难收下你吧。\n");
        command("recruit " + ob->query("id"));
}
