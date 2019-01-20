#include <ansi.h>
#include "gumu.h"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

string ask_zhen();

void create()
{
        set_name("李莫愁", ({ "li mochou", "li", "mochou" }));
        set("long", @LONG
她生得极为美貌，但冰冷的目光让人不寒而栗。
LONG);
	set("nickname", HIM "赤练仙子" NOR);
        set("gender", "女性");
        set("rank_info/respect", "道姑");
        set("age", 27);
        set("attitude","heroism");
        set("str", 30);
        set("dex", 35);
        set("con", 17);
        set("int", 25);
        set("shen_type", -1);

        create_family("古墓派", 3, "弟子");

        set_skill("unarmed", 220);
        set_skill("force", 220);
        set_skill("suxin-jue", 220);
        set_skill("yunv-xinjing", 220);
        set_skill("dodge", 220);
        set_skill("yunv-shenfa", 220);
        set_skill("qixing-bu", 220);
	      set_skill("whip", 240);
        set_skill("yunzhou-fufa", 240);
        set_skill("sanwu-shou", 240);
        set_skill("strike", 220);
        set_skill("chilian-shenzhang", 220);
        set_skill("wudu-shenzhang", 220);
        set_skill("sword", 220);
        set_skill("yunv-jian", 220);
        set_skill("unarmed", 220);
        set_skill("meinv-quan", 220);
        set_skill("throwing", 240);
        set_skill("bingpo-shenzhen", 240);
        set_skill("literate", 220);
        set_skill("martial-cognize", 220);

        set("jiali", 150);

        map_skill("force", "yunv-xinjing");
        map_skill("strike", "wudu-shenzhang");
        map_skill("whip", "sanwu-shou");
        map_skill("dodge", "qixing-bu");
        map_skill("parry", "wudu-shenzhang");
        map_skill("sword", "yunv-jian");
        map_skill("throwing", "bingpo-shenzhen");
        map_skill("unarmed", "meinv-quan");
        set("combat_exp", 400000);

        set("max_qi", 6900);
        set("max_jing", 1400);
        set("neili", 5000);
        set("max_neili", 5000);

        prepare_skill("strike", "wudu-shenzhang");
        prepare_skill("unarmed", "meinv-quan");

        set("bingpo-zhen", 3);

        set("inquiry", ([
                "小龙女"     : "那是我的师妹。你问她想干什么？",
                "林朝英"     : "那是我的师祖，不该你问的你别问，小心我宰了你。",
                "冰魄银针"   : (: ask_zhen :),
        ]));

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);
        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "strike.huan" :),
                (: perform_action, "strike.shi" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();
        carry_object("/d/quanzhou/obj/fuchen");
        carry_object("/d/wudang/obj/greenrobe")->wear();

}

int do_look(string target)
{
        object me;

        me = this_player();

        if (! id(target))
                return notify_fail("你要看什么？");

        if ((string)me->query("gender") != "女性")
        {
	        message_vision(HIR "李莫愁大怒，喝道：我最恨你们这"
                               "些薄情的臭男人，去死吧！\n" NOR, me);
                kill_ob(this_player());
        }
        return 1;
}

void attempt_apprentice(object ob)
{
        object me = this_player();

        if (! permit_recruit(ob) )
                return;

        if ((int)me->query("shen") > -70000)
        {
                command("heng");
                command("say 我李莫愁可不收心慈手软的人做徒弟。");
                return;
        }

        if ((int)me->query("combat_exp") < 400000)
        {
                command("heng");
                command("say 你这点能力怎能继承我的衣钵？");
                return;
        }
        if ((int)me->query_skill("force") < 160)
        {
                command("say 要学我五毒神掌，得先将内功练扎实。");
                return;
        }

        if ((int)me->query_skill("strike", 1) < 120)
        {
                command("say 要学我的五毒神掌，需要精湛的掌法作基础，"
                        "我看你在那上面下的工夫还不够啊。");
                return;
        }

        command("nod");
        command("say 好吧，我就收下你这个徒弟了。");
        command("recruit " + ob->query("id"));
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "历练" :
        case "历炼" :
        case "锻炼" :
                return QUEST_D->accept_ask(this_object(), me, topic);
                break;

        case "风魔舞" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/yunzhou-fufa/feng",
                           "name"    : "风魔舞",
                           "sk1"     : "yunzhou-fufa",
                           "lv1"     : 50,
                           "gongxian": 50,
                           "shen"    : -75000, ]));
                break;

        case "寒冰针" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/bingpo-shenzhen/bing",
                           "name"    : "寒冰针",
                           "sk1"     : "bingpo-shenzhen",
                           "lv1"     : 110,
                           "force"   : 140,
                           "gongxian": 400,
                           "shen"    : -80000, ]));
                break;

        case "无所不为" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/sanwu-shou/wei",
                           "name"    : "无所不为",
                           "sk1"     : "sanwu-shou",
                           "lv1"     : 60,
                           "gongxian": 300,
                           "shen"    : -80000, ]));
                break;

        case "赤心连环决" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/chilian-shenzhang/lian",
                           "name"    : "赤心连环决",
                           "sk1"     : "chilian-shenzhang",
                           "lv1"     : 110,
                           "force"   : 140,
                           "gongxian": 400,
                           "shen"    : -85000, ]));
                break;

        case "千幻神诀" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/wudu-shenzhang/huan",
                           "name"    : "千幻神诀",
                           "sk1"     : "wudu-shenzhang",
                           "lv1"     : 90,
                           "dodge"   : 140,
                           "gongxian": 500,
                           "shen"    : -90000, ]));
                break;

        case "无所不至" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/sanwu-shou/zhi",
                           "name"    : "无所不至",
                           "sk1"     : "sanwu-shou",
                           "lv1"     : 90,
                           "dodge"   : 100,
                           "gongxian": 400,
                           "shen"    : -95000, ]));
                break;

        case "无孔不入" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/sanwu-shou/kong",
                           "name"    : "无孔不入",
                           "sk1"     : "sanwu-shou",
                           "lv1"     : 120,
                           "force"   : 160,
                           "gongxian": 600,
                           "shen"    : -110000, ]));
                break;

        case "万毒噬心" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/wudu-shenzhang/shi",
                           "name"    : "万毒噬心",
                           "sk1"     : "wudu-shenzhang",
                           "lv1"     : 140,
                           "force"   : 180,
                           "gongxian": 800,
                           "shen"    : -120000, ]));
                break;
        default:
                return 0;
        }
}

string ask_zhen()
{
        object me;
        object ob;
        // mapping fam;

        me = this_player();

        if (me->query("family/master_name") != "李莫愁")
                return RANK_D->query_respect(me) + "与我毫无瓜葛，何以问"
                "起我的暗器？\n";

        if (me->query_skill("bingpo-zhen", 1) < 100)
                return RANK_D->query_respect(me) + "的冰魄神针手法火候还不到家"
                "，拿了冰魄银针也没有什么用。\n";

        if (query("bingpo-zhen") < 1)
                return "你来晚了，我手头的冰魄银针已经发完了。\n";

        add("bingpo-zhen", -1);

        message_vision(HIY "$N拿出一根" HIW "冰魄银针" HIY "递给$n。\n" NOR, this_object(), me);

        ob = new("/d/gumu/obj/bingpo-zhen");
        ob->move(me, 1);

        return "好吧，这根冰魄银针你先拿去用吧。\n";
}

void reset()
{
        set("bingpo-zhen", 4 + random(2));
}
