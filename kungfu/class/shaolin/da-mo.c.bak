// Npc: /kungfu/class/shaolin/da-mo.c
// Date: YZC 96/01/19

inherit NPC;
inherit F_MASTER;

#include <ansi.h>
#include "shaolin.h"

mixed ask_qingxin();
mixed ask_luan();
mixed ask_shang();
mixed ask_zhe();
mixed ask_jueming();
mixed ask_fumo();
mixed ask_jimie();
mixed ask_wuse();


void create()
{
        set_name("达摩老祖", ({
                "da mo",
                "da",
                "mo",
        }));
        set("long",
                "他是一位卷发络腮须的天竺老僧，身穿一袭邋遢金丝绣红袈裟。\n"
                "但却满面红光，目蕴慈笑，眼现智珠，一派得道高僧气势。\n"
                "他就是少林派开山鼻祖、当今武林的隐世高僧达摩祖师。\n"
        );

        set("title", HIR"少林开山祖师"NOR);
        set("gender", "男性");
        set("attitude", "friendly");
        set("class", "bonze");

        set("age", 300);
        set("shen_type", 1);

        set("str", 40);
        set("int", 50);
        set("con", 45);
        set("dex", 40);

        set("max_qi", 8000);
        set("max_jing", 4000);
        set("neili", 9000);
        set("max_neili", 9000);
        set("jiali", 50);
        set("combat_exp", 10000000);

        set_skill("buddhism", 600);
        set_skill("literate", 350);

        set_skill("blade", 320);
        set_skill("claw", 320);
        set_skill("club", 320);
        set_skill("cuff", 320);
        set_skill("dodge", 320);
        set_skill("finger", 320);
        set_skill("force", 400);
        set_skill("hand", 320);
        set_skill("parry", 320);
        set_skill("staff", 320);
        set_skill("strike", 320);
        set_skill("sword", 320);
        set_skill("whip", 320);
        set_skill("medical", 300);
        set_skill("shaolin-yishu", 300);

        set_skill("banruo-zhang", 320);
        set_skill("cibei-dao", 320);
        set_skill("damo-jian", 320);
        set_skill("fengyun-shou", 320);
        set_skill("fumo-jian", 320);
        set_skill("hunyuan-yiqi", 320);
        set_skill("shaolin-xinfa", 320);
        set_skill("jingang-quan", 320);
        set_skill("longzhua-gong", 320);
        set_skill("luohan-quan", 320);
        set_skill("nianhua-zhi", 320);
        set_skill("pudu-zhang", 320);
        set_skill("qianye-shou", 320);
        set_skill("sanhua-zhang", 320);
        set_skill("riyue-bian", 320);
        set_skill("shaolin-shenfa", 320);
        set_skill("weituo-gun", 320);
        set_skill("wuchang-zhang", 320);
        set_skill("xiuluo-dao", 320);
        set_skill("yingzhua-gong", 320);
        set_skill("yijinjing", 400);
        set_skill("yizhi-chan", 320);
        set_skill("zui-gun", 320);
        set_skill("sanscrit", 300);

        map_skill("blade", "cibei-dao");
        map_skill("claw", "longzhua-gong");
        map_skill("club", "wuchang-zhang");
        map_skill("cuff", "luohan-quan");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("finger", "nianhua-zhi");
        map_skill("force", "yijinjing");
        map_skill("hand", "fengyun-shou");
        map_skill("parry", "nianhua-zhi");
        map_skill("staff", "weituo-gun");
        map_skill("strike", "sanhua-zhang");
        map_skill("sword", "fumo-jian");
        map_skill("whip", "riyue-bian");

        prepare_skill("finger", "nianhua-zhi");
        prepare_skill("strike", "sanhua-zhang");

        set("inquiry", ([
                "绝招"   : "你想学什么绝招？",
                "绝技"   : "你想学什么绝技？",
                "达摩清心剑": (: ask_qingxin :),
                "清心剑"    : (: ask_qingxin :),
                "达摩乱气剑": (: ask_luan :),
                "乱气剑"    : (: ask_luan :),
                "达摩伤神剑": (: ask_shang :),
                "伤神剑"    : (: ask_shang :),
                "达摩折元剑": (: ask_zhe :),
                "折元剑"    : (: ask_zhe :),
                "无色无相"    : (: ask_wuse :),
                "修罗绝命指"    : (: ask_jueming :),
                "金刚伏魔决"    : (: ask_fumo :),
                "菩提寂灭"    : (: ask_jimie :),
        ]));

        create_family("少林派", 1, "开山祖师");

        set_temp("apply/attack", 300);
        set_temp("apply/defense", 300);
        set_temp("apply/damage", 150);
        set_temp("apply/unarmed_damage", 150);

        setup();
        carry_object("/d/shaolin/obj/xuan-cloth")->wear();
}

void attempt_apprentice(object ob)
{
        object me; 
        mapping ob_fam, my_fam;
        string name, new_name;

        if (! permit_recruit(ob))
                return;

        me = this_object();
        my_fam  = me->query("family");

        name = ob->query("name");

        if (! (ob_fam = ob->query("family")) ||
            ob_fam["family_name"] != "少林派")
        {
                command("say " + RANK_D->query_respect(ob) +
                        "与本派素无来往，不知此话从何谈起？");
                return;
        }

        if ((string)ob->query("class") != "bonze")
        {
                command("say " + RANK_D->query_respect(ob) +
                        "是俗家弟子，不能在寺内学艺。");
                return;
        }

        if ((int)ob_fam["generation"] != 36)
        {
                command("say " + RANK_D->query_respect(ob) +
                        "，贫僧哪里敢当！");
                return;
        }

        if ((int)ob->query_int() < 35)
        {
                command("say " + RANK_D->query_respect(ob) + "悟性仍有不足，"
                        "需要进一步锻炼才能领悟更高深的佛法。");
        }

        if ((int)ob->query("WPK") > 3)
        {
                command("sigh");
                command("say " + RANK_D->query_respect(ob) + "杀戮心太重，"
                        "不适合继续学习武功。");
                return;
        }

        if ((int)ob->query_skill("buddhism", 1) < 180)
        {
                command("say " + RANK_D->query_respect(ob) + "禅宗心法"
                        "领悟得不够，不妨先多加钻研。");
                return;
        }

        if ((int)ob->query_skill("dodge", 1) < 180)
        {
                command("say " + RANK_D->query_respect(ob) + "基本轻功"
                        "火候尚有欠缺，不妨先苦心修炼。");
                return;
        }

        if ((int)ob->query_skill("force", 1) < 180)
        {
                command("say " + RANK_D->query_respect(ob) + "基本内功"
                        "火候尚有欠缺，不妨先苦心修炼。");
                return;
        }

        if ((int)ob->query_skill("parry", 1) < 180)
        {
                command("say " + RANK_D->query_respect(ob) + "基本招架"
                        "火候尚有欠缺，不妨先苦心修炼。");
                return;
        }

        if ((int)ob->query("combat_exp") < 1000000)
        {
                command("say " + RANK_D->query_respect(ob) + "实战经验"
                        "还颇有欠缺，不如先苦心修炼。");
                return;
        }

        command("char 老衲又得一可塑之才，真是大畅老怀 !");
        name = ob->query("name");
        new_name = "渡" + name[2..3];
        NAME_D->remove_name(ob->query("name"), ob->query("id"));
        ob->set("name", new_name);
        NAME_D->map_name(ob->query("name"), ob->query("id"));

        command("say 从今以后你的法名叫做" + new_name + "。");
        command("recruit " + ob->query("id"));
        return;
}

mixed ask_qingxin()
{
        object me;

        me = this_player();
        if (me->query("can_perform/damo-jian/qingxin"))
                return "自己好好多练习吧，牢记慈悲为怀，勿得乱用！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) +
                       "并非我们少林弟子，何出此言？";

        if (! me->is_apprentice_of(this_object()))
                return "此招非我弟子不能传，还望这位" +
                       RANK_D->query_respect(me) + "见谅。";

        if (me->query("shen") < 120000)
                return "此招用于降妖除魔，你既然不擅于此道，又何必学它？";

        if (me->query_skill("damo-jian", 1) < 200)
                return "你的达魔剑法还不到家，无法领会其中奥妙！";

        message_vision(HIY "$n" HIY "看看$N" HIY
                       "，道：“好吧，你且听仔细了！”说罢在$N"
                       HIY "耳边轻声说了些什么。\n" NOR,
                       me, this_object());
        command("say 记住，除非降妖除魔万不得已，勿要轻易使用。");
        tell_object(me, HIG "你学会了达魔乱气剑。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 160000);
        me->set("can_perform/damo-jian/luan", 1);
        return 1;
}

mixed ask_luan()
{
        object me;

        me = this_player();
        if (me->query("can_perform/damo-jian/qingxin"))
                return "自己好好多练习吧，牢记慈悲为怀，勿得乱用！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "并非我们少林弟子，何出此言？";

        if (! me->is_apprentice_of(this_object()))
                return "此招非我弟子不能传，还望这位" +
                       RANK_D->query_respect(me) + "见谅。";

        if (me->query("shen") < 120000)
                return "此招用于降妖除魔，你既然不擅于此道，又何必学它？";

        if (me->query_skill("damo-jian", 1) < 200)
                return "你的达魔剑法还不到家，无法领会其中奥妙！";

        message_vision(HIY "$n" HIY "看看$N" HIY
                       "，道：“好吧，你且听仔细了！”说罢在$N"
                       HIY "耳边轻声说了些什么。\n" NOR,
                       me, this_object());
        command("say 记住，除非降妖除魔万不得已，勿要轻易使用。");
        tell_object(me, HIG "你学会了达魔清心剑。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 160000);
        me->set("can_perform/damo-jian/qingxin", 1);
        return 1;
}

mixed ask_shang()
{
        object me;

        me = this_player();
        if (me->query("can_perform/damo-jian/shang"))
                return "自己好好多练习吧，牢记慈悲为怀，勿得乱用！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) +
                       "并非我们少林弟子，何出此言？";

        if (! me->is_apprentice_of(this_object()))
                return "此招非我弟子不能传，还望这位" +
                       RANK_D->query_respect(me) + "见谅。";

        if (me->query("shen") < 120000)
                return "此招用于降妖除魔，你既然不擅于此道，又何必学它？";

        if (me->query_skill("damo-jian", 1) < 200)
                return "你的达魔剑法还不到家，无法领会其中奥妙！";

        message_vision(HIY "$n" HIY "看看$N" HIY
                       "，道：“好吧，你且听仔细了！”说罢在$N"
                       HIY "耳边轻声说了些什么。\n" NOR,
                       me, this_object());
        command("say 记住，除非降妖除魔万不得已，勿要轻易使用。");
        tell_object(me, HIG "你学会了达魔伤神剑。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 160000);
        me->set("can_perform/damo-jian/shang", 1);
        return 1;
}

mixed ask_zhe()
{
        object me;

        me = this_player();
        if (me->query("can_perform/damo-jian/zhe"))
                return "自己好好多练习吧，牢记慈悲为怀，勿得乱用！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) +
                       "并非我们少林弟子，何出此言？";

        if (! me->is_apprentice_of(this_object()))
                return "此招非我弟子不能传，还望这位" +
                       RANK_D->query_respect(me) + "见谅。";

        if (me->query("shen") < 120000)
                return "此招用于降妖除魔，你既然不擅于此道，又何必学它？";

        if (me->query_skill("damo-jian", 1) < 200)
                return "你的达魔剑法还不到家，无法领会其中奥妙！";

        message_vision(HIY "$n" HIY "看看$N" HIY
                       "，道：“好吧，你且听仔细了！”说罢在$N"
                       HIY "耳边轻声说了些什么。\n" NOR,
                       me, this_object());
        command("say 记住，除非降妖除魔万不得已，勿要轻易使用。");
        tell_object(me, HIG "你学会了达魔折元剑。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 160000);
        me->set("can_perform/damo-jian/zhe", 1);
        return 1;
}

mixed ask_jimie()
{
        object me;

        me = this_player();
        if (me->query("can_perform/duoluoye-zhi/jimie"))
                return "自己好好多练习吧，牢记慈悲为怀，勿得乱用！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) +
                       "并非我们少林弟子，何出此言？";

        if (! me->is_apprentice_of(this_object()))
                return "此招非我弟子不能传，还望这位" +
                       RANK_D->query_respect(me) + "见谅。";

        if (me->query("shen") < 120000)
                return "此招用于降妖除魔，你既然不擅于此道，又何必学它？";

        if (me->query_skill("duoluoye-zhi", 1) < 200)
                return "你的多罗叶指还不到家，无法领会其中奥妙！";

        message_vision(HIY "$n" HIY "看看$N" HIY
                       "，道：“好吧，你且听仔细了！”说罢在$N"
                       HIY "耳边轻声说了些什么。\n" NOR,
                       me, this_object());
        command("say 记住，除非降妖除魔万不得已，勿要轻易使用。");
        tell_object(me, HIG "你学会了菩提寂灭。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 160000);
        me->set("can_perform/duoluoye-zhi/jimie", 1);
        return 1;
}

mixed ask_fumo()
{
        object me;

        me = this_player();
        if (me->query("can_perform/jingang-zhi/fumo"))
                return "自己好好多练习吧，牢记慈悲为怀，勿得乱用！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) +
                       "并非我们少林弟子，何出此言？";

        if (! me->is_apprentice_of(this_object()))
                return "此招非我弟子不能传，还望这位" +
                       RANK_D->query_respect(me) + "见谅。";

        if (me->query("shen") < 120000)
                return "此招用于降妖除魔，你既然不擅于此道，又何必学它？";

        if (me->query_skill("jingang-zhi", 1) < 200)
                return "你的金刚指还不到家，无法领会其中奥妙！";

        message_vision(HIY "$n" HIY "看看$N" HIY
                       "，道：“好吧，你且听仔细了！”说罢在$N"
                       HIY "耳边轻声说了些什么。\n" NOR,
                       me, this_object());
        command("say 记住，除非降妖除魔万不得已，勿要轻易使用。");
        tell_object(me, HIG "你学会了金刚伏魔决。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 160000);
        me->set("can_perform/jingang-zhi/fumo", 1);
        return 1;
}

mixed ask_jueming()
{
        object me;

        me = this_player();
        if (me->query("can_perform/xiuluo-zhi/jueming"))
                return "自己好好多练习吧，牢记慈悲为怀，勿得乱用！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) +
                       "并非我们少林弟子，何出此言？";

        if (! me->is_apprentice_of(this_object()))
                return "此招非我弟子不能传，还望这位" +
                       RANK_D->query_respect(me) + "见谅。";

        if (me->query("shen") < 120000)
                return "此招用于降妖除魔，你既然不擅于此道，又何必学它？";

        if (me->query_skill("xiuluo-zhi", 1) < 200)
                return "你的修罗指还不到家，无法领会其中奥妙！";

        message_vision(HIY "$n" HIY "看看$N" HIY
                       "，道：“好吧，你且听仔细了！”说罢在$N"
                       HIY "耳边轻声说了些什么。\n" NOR,
                       me, this_object());
        command("say 记住，除非降妖除魔万不得已，勿要轻易使用。");
        tell_object(me, HIG "你学会了修罗绝命指。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 160000);
        me->set("can_perform/xiuluo-zhi/jueming", 1);
        return 1;
}

mixed ask_wuse()
{
        object me;

        me = this_player();
        if (me->query("can_perform/wuxiang-zhi/wuse"))
                return "自己好好多练习吧，牢记慈悲为怀，勿得乱用！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) +
                       "并非我们少林弟子，何出此言？";

        if (! me->is_apprentice_of(this_object()))
                return "此招非我弟子不能传，还望这位" +
                       RANK_D->query_respect(me) + "见谅。";

        if (me->query("shen") < 120000)
                return "此招用于降妖除魔，你既然不擅于此道，又何必学它？";

        if (me->query_skill("wuxiang-zhi", 1) < 200)
                return "你的无相劫指还不到家，无法领会其中奥妙！";

        message_vision(HIY "$n" HIY "看看$N" HIY
                       "，道：“好吧，你且听仔细了！”说罢在$N"
                       HIY "耳边轻声说了些什么。\n" NOR,
                       me, this_object());
        command("say 记住，除非降妖除魔万不得已，勿要轻易使用。");
        tell_object(me, HIG "你学会了无色无相。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 160000);
        me->set("can_perform/wuxiang-jie/wuse", 1);
        return 1;
}

