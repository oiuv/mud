#include <ansi.h>
#include "wudang.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

mixed ask_me();

void create()
{
        set_name("张松溪", ({ "zhang songxi", "zhang", "songxi" }));
        set("nickname", HIC "武当四侠" NOR);
        set("long", "他就是张三丰的四弟子张松溪。他今年四\n"
                    "十岁，精明能干，以足智多谋著称。\n");
        set("gender", "男性");
        set("age", 40);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 26);
        set("int", 33);
        set("con", 26);
        set("dex", 28);
        set("max_qi", 5000);
        set("max_jing", 5000);
        set("neili", 4500);
        set("max_neili", 4500);
        set("jiali", 150);
        set("combat_exp", 1400000);
        set("score", 60000);

        set_skill("force", 220);
        set_skill("wudang-xinfa", 220);
        set_skill("taiji-shengong", 200);
        set_skill("dodge", 220);
        set_skill("tiyunzong", 220);
        set_skill("unarmed", 200);
        set_skill("taiji-quan", 180);
        set_skill("strike", 200);
        set_skill("wudang-zhang", 200);
        set_skill("hand", 200);
        set_skill("paiyun-shou", 200);
        set_skill("parry", 200);
        set_skill("sword", 200);
        set_skill("wudang-jian", 200);
        set_skill("blade", 220);
        set_skill("xuanxu-dao", 220);
        set_skill("taiji-jian", 180);
        set_skill("taoism", 220);
        set_skill("literate", 160);
        set_skill("martial-cognize", 200);

        set("no_teach", ([
                "taiji-shengong" : "要想学习太极神功请向张真人请教。",
                "taiji-jian"     : "太极剑必须张真人亲传。",
                "taiji-quan"     : "太极拳必须张真人亲传。",
        ]));

        map_skill("force", "taiji-shengong");
        map_skill("dodge", "tiyunzong");
        map_skill("unarmed", "taiji-quan");
        map_skill("parry", "xuanxu-dao");
        map_skill("sword", "wudang-jian");
        map_skill("blade", "xuanxu-dao");
        map_skill("strike", "wudang-zhang");

        prepare_skill("unarmed", "taiji-quan");
        prepare_skill("strike", "wudang-zhang");

        create_family("武当派", 2, "弟子");

        set("inquiry", ([
                "乱环诀" : (: ask_me :),
        ]));

        set("coagents", ({
                ([ "startroom" : "/d/wudang/houyuan",
                   "id"        : "yu lianzhou" ]),
                ([ "startroom" : "/d/wudang/sanqingdian",
                   "id"        : "song yuanqiao" ]),
        }));

        set("chat_chance_combat", 40);
        set("chat_msg_combat", ({
                (: perform_action, "blade.huan" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
		(: exert_function, "shield" :),
        }) );

        setup();
        carry_object("/clone/weapon/blade")->wield();
        carry_object("/d/wudang/obj/whiterobe")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 8000)
        {
                command("say 我武当乃是堂堂名门正派，对弟子要求极严。");
                command("say 在德行方面，" + RANK_D->query_respect(ob) +
                        "是否还做得不够？");
                return;
        }

        if ((int)ob->query_skill("wudang-xinfa", 1) < 60)
        {
                command("say 我武当派最注重内功心法" + RANK_D->query_respect(ob)+
                        "是否应该在武当心法上多下点功夫啊?");
                return;
        }

        if ((int)ob->query_skill("taoism", 1) < 60)
        {
                command("say 习武是为了强身健体，一味的练武是不可取的。");
                command("say 我看你还需要在修身养性方面多锻炼锻炼，以提"
                        "高你的道德心法。");
                return;
        }

        command("say 好吧，我就收下你了。");
        command("say 希望你能好好用功，消灭邪魔外道！");
        command("recruit " + ob->query("id"));
        if ((string)ob->query("class") != "taoist")
                ob->set("class", "taoist");
}

mixed ask_me()
{
        object me;

        me = this_player();
        if (me->query("can_perform/xuanxu-dao/huan"))
                return "我都教给你了，自己好好多练习吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("xuanxu-dao", 1) < 1)
                return "你连玄虚刀法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 150)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 10000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("xuanxu-dao", 1) < 100)
                return "你的玄虚刀法还不到家，要多练练！";

        message_vision(HIY "$n" HIY "点了点头，随手挥舞手中钢刀，画出一"
                       "个个圆\n圈，每招均是以弧形刺出，弧形收回。刀出成"
                       "环，环\n环相连，直看得$N" HIY "眼花缭乱。\n" NOR,
                       me, this_object());
        command("smile");
        command("say 你可明白了玄虚刀法的要诣？");
        tell_object(me, HIC "你学会了「乱环决」。\n" NOR);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("xuanxu-dao"))
                me->improve_skill("xuanxu-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xuanxu-dao/huan", 1);
        me->add("gongxian", -150);

        return 1;
}
