#include <ansi.h>
#include "etc.h"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

mixed ask_me();
mixed ask_skill();

void create()
{
        set_name("桑土公", ({ "sang tugong", "sang", "tugong"}));
        set("gender", "男性");
        set("title", "川西碧磷洞洞主");
        set("age", 58);
        set("long", @LONG
这便是川西碧磷洞洞主端桑土公，只见他身材
矮小，须发皆白。手持一个大铜鼎，鼎足上铸
着一个“桑”字，乃是几条小蛇、蜈蚣之形盘
成，铜绿斑斓，宛是一件古物。
LONG );
        set("attitude", "peaceful");
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 4200);
        set("max_qi", 4200);
        set("jing", 2000);
        set("max_jing", 2000);
        set("neili", 3800);
        set("max_neili", 3800);
        set("jiali", 100);
        set("combat_exp", 2000000);

        set_skill("force", 180);
        set_skill("shennong-xinjing", 180);
        set_skill("dodge", 200);
        set_skill("xuefu-mizong", 200);
        set_skill("strike", 180);
        set_skill("dusha-zhang", 180);
        set_skill("hand", 180);
        set_skill("lansha-shou", 180);
        set_skill("parry", 180);
        set_skill("staff", 180);
        set_skill("shennong-zhang", 180);
        set_skill("throwing", 220);
        set_skill("pidi-shenzhen", 220);
        set_skill("literate", 160);
        set_skill("poison", 200);
        set_skill("martial-cognize", 180);

        map_skill("force", "shennong-xinjing");
        map_skill("dodge", "xuefu-mizong");
        map_skill("strike", "dusha-zhang");
        map_skill("hand", "lansha-shou");
        map_skill("throwing", "pidi-shenzhen");
        map_skill("parry", "jiuqu-zhegufa");
        map_skill("staff", "shennong-zhang");

        prepare_skill("hand", "lansha-shou");
        prepare_skill("strike", "dusha-zhang");

        set("inquiry", ([
                "斓蜈金针"   : (: ask_me :),
                "幻遁寒星"   : (: ask_skill :),
                "虚竹"       : "他是我们灵鹫宫新的主公，我们全部听他号令。",
                "虚竹子"     : "他是我们灵鹫宫新的主公，我们全部听他号令。",
        ]));

        create_family("碧磷洞", 8, "洞主");

        set("zhen_count", 3);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "staff.lun" :),
                (: perform_action, "throwing.huan" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        setup();
        carry_object("/clone/weapon/gangzhang")->wield();
        carry_object("/clone/cloth/cloth")->wear();
        set_temp("handing", carry_object("/d/lingjiu/npc/obj/jinzhen"));
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "灵鹫宫")
        {
                command("bite");
                command("say 快滚，快滚！我可没时间和你耗。");
                return -1;
        }

        if (ob->query("family/master_id") != "xuzhu zi")
        {
                command("heng");
                command("say 你算什么东西？就是你师父我也不放在眼里。");
                return -1;

        }

        if (skill != "pidi-shenzhen" && skill != "throwing")
        {
                command("say 我能只教你一些暗器手法，不学就算了。");
                return -1;
        }

        if (skill == "throwing" && ob->query_skill("throwing", 1) > 179)
        {
                command("say 你暗器的造诣已经很高了，剩下的就自己去研究吧。");
                return -1;
        }

        if (! ob->query_temp("can_learn/sangtugong"))
        {
                command("bored");
                command("say 唉……看在主公的份上，我教你好了。");
                ob->set_temp("can_learn/sangtugong", 1);
        }
        return 1;
}

mixed ask_skill()
{
        object me;

        me = this_player();
        if (me->query("can_perform/pidi-shenzhen/huan"))
                return "我不是已经教会你了吗？";

        if (me->query("family/family_name") != "灵鹫宫" &&
           me->query("family/family_name") != "碧磷洞")
                return "快给我滚开！我可没时间和你耗。";

        if (me->query_skill("pidi-shenzhen", 1) < 1)
                return "你辟地神针都没学，还谈什么绝招。";

        if (me->query("family/family_name") == "灵鹫宫" &&
           me->query("gongxian") < 600)
                return "嗯，主公说过了，不得传功给无功劳的弟子。";

        if (me->query_skill("force") < 200)
                return "你的内功差成这样，怎么学绝技？";

        if (me->query_skill("pidi-shenzhen", 1) < 140)
                return "你的辟地神针火候还差得远，再回去练练！";

        message_vision(HIY "$n" HIY "阴阴一笑，将$N" HIY "招至跟前，轻"
                       "声在耳旁秘密说了些什么。随后又伸出右\n手，十指"
                       "箕张，一伸一缩，看样子是一种很特别的暗器法门。\n"
                       NOR, me, this_object());

        command("grin");
        command("say 这招在打架的时候很管用，如果抹上了毒……嘿嘿。");
        tell_object(me, HIC "你学会了「幻遁寒星」。\n" NOR);
        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("pidi-shenzhen"))
                me->improve_skill("pidi-shenzhen", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/pidi-shenzhen/huan", 1);
        if (me->query("family/family_name") == "灵鹫宫")
                me->add("gongxian", -600);
        return 1;
}

mixed ask_me()
{
        object me;
        object ob;

        me = this_player();

        if (me->query("family/family_name") != "灵鹫宫" &&
           me->query("family/family_name") != "碧磷洞")
                return "滚开！我可没时间和你耗。";

        if (me->query("family/master_id") != "xuzhu zi")
                return "让你师父来拿，这宝贝可不能乱送人。";

        if (me->query_skill("pidi-shenzhen", 1) < 100)
                return "你辟地神针的手法还不到家，拿了这针也没什么用。";

        if (query("zhen_count") < 1)
                return "没了，没了！我老底都被你掀干净了。";

        add("zhen_count", -1);
        ob = new("/d/lingjiu/npc/obj/jinzhen");
        message_vision("$N拿出五十根" HIR "斓蜈金针" NOR "(Lanwu jinzhen)给$n。\n",
                       this_object(), me);
        ob->move(me, 1);
        return "我这儿的斓蜈金针你先拿去用吧。";
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("sigh2");
        command("say 这个世道真是什么人都有，摆着那么多门派不拜，却跑来拜我。");
        command("say 亏你也想得出来，既然来了，我就收下你吧。");
        command("recruit " + ob->query("id"));
}
