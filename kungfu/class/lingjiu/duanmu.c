#include <ansi.h>
#include "etc.h"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

mixed ask_me();

void create()
{
        set_name("端木元", ({ "duanmu yuan", "duanmu", "yuan"}));
        set("gender", "男性");
        set("title", "海南岛赤焰洞洞主");
        set("nickname", HIR "归去来兮" NOR);
        set("age", 54);
        set("long", @LONG
这大头老者就是海南岛五指山赤焰洞洞主端木
元。只见他一颗大脑袋光秃秃地，半根头发也
无，脸上巽血，远远望去，便如大血球般。
LONG );
        set("attitude", "peaceful");
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 4000);
        set("max_qi", 4000);
        set("jing", 1800);
        set("max_jing", 1800);
        set("neili", 4200);
        set("max_neili", 4200);
        set("jiali", 120);
        set("combat_exp", 2200000);

        set_skill("force", 200);
        set_skill("wudoumi-shengong", 200);
        set_skill("dodge", 180);
        set_skill("feiyan-zoubi", 180);
        set_skill("unarmed", 200);
        set_skill("parry", 200);
        set_skill("martial-cognize", 180);
        set_skill("literate", 140);

        map_skill("dodge", "feiyan-zoubi");
        map_skill("force", "wudoumi-shengong");
        map_skill("parry", "wudoumi-shengong");
        map_skill("unarmed", "wudoumi-shengong");

        prepare_skill("unarmed", "wudoumi-shengong");

        set("inquiry", ([
                "归去来兮"   : (: ask_me :),
                "五斗米神功" : "这…这个……这是由地火功演化而来的一门功夫。",
                "地火功"     : "地火功是我海南岛五指山赤焰洞一派的基本功夫。",
                "虚竹子"     : "他是我们灵鹫宫新的主公，我们全部听他号令。",
                "虚竹"       : "他是我们灵鹫宫新的主公，我们全部听他号令。",
        ]));

        create_family("赤焰洞", 14, "洞主");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.gui" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "灵鹫宫")
        {
                command("?");
                command("say 你是哪里钻来的鬼东西？");
                return -1;
        }

        if (ob->query("family/master_id") != "xuzhu zi")
        {
                command("grin");
                command("say 恐怕这灵鹫宫里，还轮不到你说话吧？");
                return -1;

        }

        if (skill != "wudoumi-shengong" && skill != "unarmed")
        {
                command("say 我只传授你五斗米神功和一些拳脚知识，不学就算了。");
                return -1;
        }

        if (skill == "unarmed" && ob->query_skill("unarmed", 1) > 179)
        {
                command("sweat");
                command("say 够了，够了！累死我了，剩下的你自己去研究。");
                return -1;
        }

        if (! ob->query_temp("can_learn/duanmuyuan"))
        {
                command("sigh");
                command("say 这个…既然你是主公派来的，我也只有教你好了。");
                ob->set_temp("can_learn/duanmuyuan", 1);
        }
        return 1;
}

mixed ask_me()
{
        object me;

        me = this_player();
        if (me->query("can_perform/wudoumi-shengong/gui"))
                return "本洞主已经说得够多了，自己下去练吧。";

        if (me->query("family/family_name") != "灵鹫宫" &&
           me->query("family/family_name") != "赤焰洞")
                return "哪里钻来的鬼东西，快给本洞主滚开！";

        if (me->query_skill("wudoumi-shengong", 1) < 1)
                return "嘿！你学过本洞主的五斗米神功吗？";

        if (me->query("family/family_name") == "灵鹫宫" &&
           me->query("gongxian") < 1500)
                return "嗯，主公说过了，不得传功给无功劳的弟子。";

        if (me->query_skill("force") < 200)
                return "你看你，内功练成这样，像什么话！";

        if ((int)me->query("max_neili", 1) < 2000)
                return "你的内力弱成这样，怎么学习归去来兮？";

        if (me->query_skill("wudoumi-shengong", 1) < 140)
                return "你的五斗米神功火候还差得远，再回去练练！";

        message_vision(HIY "$n" HIY "点了点头，一声咳嗽，朝着$N" HIY "吐出"
                       "一口浓痰，$N" HIY "不明\n其理，当即侧身躲过。可霎时"
                       "却见那口浓痰在$N" HIY "身后转了个\n弯，又飞了回来，"
                       "正直打在$N" HIY "的后脑上。\n" NOR, me,
                       this_object());
        command("haha");
        command("say 看懂了吗？这东西难练得紧，可要多花些功夫。");
        command("say 还有就是，施功前要将全身功力尽数提起，这样才得心应手。");
        tell_object(me, HIC "你学会了「归去来兮」。\n" NOR);
        tell_object(me, HIC "你学会了如何将五斗米神功作为拳脚施展。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("wudoumi-shengong"))
                me->improve_skill("wudoumi-shengong", 1500000);
        if (me->can_improve_skill("wudoumi-shengong"))
                me->improve_skill("wudoumi-shengong", 1500000);
        if (me->can_improve_skill("wudoumi-shengong"))
                me->improve_skill("wudoumi-shengong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/wudoumi-shengong/gui", 1);
        if (me->query("family/family_name") == "灵鹫宫")
                me->add("gongxian", -1500);
        return 1;
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("@@");
        command("say 你…你没搞错吧？既然这样，那你跟着我好了。");
        command("recruit " + ob->query("id"));
}

void unconcious()
{
        die();
}
