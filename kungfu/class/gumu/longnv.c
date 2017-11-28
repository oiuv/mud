inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

#include <ansi.h>
#include "gumu.h"

#define YINSUO    "/clone/lonely/yinsuo"

string ask_zhen();

void create()
{
        object ob;

        set_name("小龙女", ({ "xiao longnv", "xiao", "longnv" }));
        set("gender", "女性");
        set("age", 22);
        set("long", @LONG
她一生爱穿白衣，当真如风拂玉树，雪裹琼苞，
兼之生性清冷，实当得起“冷浸溶溶月”的形
容。
LONG);
        set("attitude", "friendly");
        set("str", 21);
        set("int", 30);
        set("con", 25);
        set("dex", 26);
        set("per", 29);
        set("shen_type", 1);

        set("qi", 5000);
        set("max_qi", 5000);
        set("jing", 2000);
        set("max_jing", 2000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 100);

        set("combat_exp", 3000000);

        set_skill("force", 220);
        set_skill("suxin-jue", 220);
        set_skill("yunv-xinjing", 220);
        set_skill("sword", 220);
        set_skill("yunv-jian", 220);
        set_skill("suxin-jian", 220);
        set_skill("quanzhen-jian", 200);
        set_skill("whip", 220);
        set_skill("yinsuo-jinling", 220);
        set_skill("dodge", 200);
        set_skill("yunv-shenfa", 200);
        set_skill("parry", 200);
        set_skill("unarmed", 200);
        set_skill("meinv-quan", 200);
        set_skill("strike", 220);
        set_skill("tianluo-diwang", 220);
        set_skill("zuoyou-hubo", 200);
        set_skill("literate", 200);
        set_skill("throwing", 220);
        set_skill("yufeng-zhen", 220);
        set_skill("martial-cognize", 200);

        map_skill("force", "yunv-xinjing");
        map_skill("whip", "yinsuo-jinling");
        map_skill("sword", "suxin-jian");
        map_skill("dodge", "yunv-shenfa");
        map_skill("parry", "meinv-quan");
        map_skill("unarmed", "meinv-quan");
        map_skill("strike", "tianluo-diwang");
        map_skill("throwing", "yufeng-zhen");

        prepare_skill("strike", "tianluo-diwang");
        prepare_skill("unarmed", "meinv-quan");

        create_family("古墓派", 3, "弟子");

        set("yfzhen_count", 3);

        set("inquiry", ([
                "玉蜂针"   : (: ask_zhen :),
        ]));

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: command("perform strike.wang and unarmed.you") :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: perform_action, "whip.feng twice" :),
        }) );

        setup();
        if (clonep())
        {
                ob = find_object(YINSUO);
                if (! ob) ob = load_object(YINSUO);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/clone/weapon/changbian");
                        ob->move(this_object());
                        ob->wield();
                }
        }
        carry_object("/clone/cloth/baipao")->wear();

}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob) )
                return;

        if (ob->query("per") < 26)
        {
                command("say 尊容实在不敢恭维，我看你还是算了吧。\n");
                return;
        }

        command("say 好吧，我就收下你这个徒儿了。\n");
        command("recruit " + ob->query("id"));
}

string ask_zhen()
{
        object me;
        object ob;
        mapping fam;

        me = this_player();

        if (! (fam = me->query("family")) || fam["family_name"] != "古墓派")
                return RANK_D->query_respect(me) + "与本派毫无瓜葛，何以问"
                "起本派暗器？\n";

        if (me->query_skill("yufeng-zhen", 1) < 100)
                return RANK_D->query_respect(me) + "的玉蜂针手法火候还不到家"
                "，拿了玉蜂针也没有什么用。\n";

        if (query("yfzhen_count") < 1)
                return "你来晚了，我手头的玉蜂针已经发完了。\n";

        add("yfzhen_count", -1);
        
        message_vision(HIY "$N拿出一根玉蜂针递给$n。\n" NOR, this_object(), me);

        ob = new("/d/gumu/obj/yufeng-zhen");
        ob->move(me, 1);

        return "好吧，这根玉蜂针你先拿去用吧。\n";
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "银索金铃" :
                return MASTER_D->give_item(me, this_object(),
                        ([ "item"    : YINSUO,
                           "master"  : 1,
                           "sk1"     : "yinsuo-jinling",
                           "lv1"     : 150, ]));
                break;

        case "千姿百媚" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/yunv-jian/mei",
                           "name"    : "千姿百媚",
                           "sk1"     : "yunv-jian",
                           "lv1"     : 35,
                           "dodge"   : 30,
                           "gongxian": 50, ]));
                break;

        case "天罗地网势" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tianluo-diwang/wang",
                           "name"    : "天罗地网势",
                           "sk1"     : "tianluo-diwang",
                           "lv1"     : 60,
                           "dodge"   : 30,
                           "gongxian": 60, ]));


        case "古墓幽居" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/meinv-quan/you",
                           "name"    : "古墓幽居",
                           "sk1"     : "meinv-quan",
                           "lv1"     : 70,
                           "force"   : 70,
                           "gongxian": 160, ]));
                break;

        case "隔空点穴" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/yinsuo-jinling/dian",
                           "name"    : "隔空点穴",
                           "sk1"     : "yinsuo-jinling",
                           "lv1"     : 70,
                           "force"   : 90,
                           "gongxian": 260, ]));
                break;

        case "无影针" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/yufeng-zhen/ying",
                           "name"    : "无影针",
                           "sk1"     : "yufeng-zhen",
                           "lv1"     : 90,
                           "force"   : 100,
                           "gongxian": 300, ]));
                break;

        case "双剑合壁" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/suxin-jian/he",
                           "name"    : "双剑合壁",
                           "sk1"     : "suxin-jian",
                           "lv1"     : 130,
                           "force"   : 120,
                           "dodge"   : 100,
                           "gongxian": 400, ]));

                break;
        default:
                return 0;
        }
}

void reset()
{
        set("yfzhen_count", 4 + random(2));
}

void unconcious()
{
        die();
}
