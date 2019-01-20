#include <ansi.h>
#include "meizhuang.h"

#define QIPAN    "/clone/lonely/qipan"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;
inherit F_COAGENT;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_qipan();

void create()
{
        object ob;
        set_name("黑白子", ({ "heibai zi", "hei", "bai", "heibai", "zi" }));
        set("long", @LONG
这是一位极高极瘦的黑衣老者，这就是梅庄四
位庄主排行第二的黑白子。这人眉清目秀，只
是脸色泛白，似乎是一具僵尸模样，令人一见
之下，心中便感到一阵凉意。他头发极黑而皮
肤极白，果然是黑白分明。
LONG);
        set("title", "梅庄二庄主");
        set("nickname", HIR "梅庄四友" NOR);
        set("gender", "男性");
        set("age", 58);
        set("attitude", "peaceful");
        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("max_qi", 5000);
        set("max_jing", 4500);
        set("neili", 5500);
        set("max_neili", 5500);
        set("jiali", 200);
        set("combat_exp", 2500000);

        set_skill("force", 220);
        set_skill("wuzheng-xinfa", 200);
        set_skill("xuantian-wujigong", 220);
        set_skill("dodge", 220);
        set_skill("meihua-zhuang", 220);
        set_skill("parry", 220);
        set_skill("hammer", 240);
        set_skill("finger", 240);
        set_skill("xuantian-zhi", 240);
        set_skill("fenglei-panfa", 240);
        set_skill("strike", 200);
        set_skill("qingmang-zhang", 200);
        set_skill("literate", 200);
        set_skill("fenglei-zifa", 240);
        set_skill("throwing", 240);
        set_skill("chess", 280);
        set_skill("martial-cognize", 220);

        map_skill("force", "xuantian-wujigong");
        map_skill("dodge", "meihua-zhuang");
        map_skill("parry", "fenglei-panfa");
        map_skill("hammer", "fenglei-panfa");
        map_skill("strike", "qingmang-zhang");
        map_skill("throwing", "fenglei-zifa");
        map_skill("finger", "xuantian-zhi");

        prepare_skill("finger", "xuantian-zhi");

        create_family("梅庄", 1, "庄主");

        set("inquiry", ([
                "绝招"        : "你要问什么绝招？",
                "绝技"        : "你要问什么绝技？",
                "任我行"      : "任我行乃日月神教上代教主，不过已经失踪很久了。",
                "东方不败"    : "东方教主武功深不可测，天下无敌。",
                "日月神教"    : "我们梅庄四友和日月神教已无瓜葛，你提它作甚？",
                "呕血谱"      : "那是传说中的东西，根本不存在。",
                "射日诀"      : (: ask_skill1 :),
                "风雷四击"    : (: ask_skill2 :),
                "冰坚地狱"    : (: ask_skill3 :),
                "玄铁棋盘"    : (: ask_qipan :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "hammer.fenglei" :),
                (: perform_action, "throwing.she" :),
                (: perform_action, "finger.bing" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),

        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        if (clonep())
        {
                ob = find_object(QIPAN);
                if (! ob) ob = load_object(QIPAN);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/d/meizhuang/obj/qipan");
                        ob->move(this_object());
                        ob->wield();
                }
        }
        carry_object("clone/misc/cloth")->wear();
        set_temp("handing", carry_object("/d/meizhuang/obj/qizi"));
}

void attempt_apprentice(object me)
{
        // string purename, name, new_name;

        if (! permit_recruit(me))
                return;

        if ( me->query("family/family_name") &&
             me->query("family/family_name") == "日月神教" &&
             me->query("family/master_name") == "东方不败" )
        {
                command("ah");
                command("say 原来是东方教主的弟子，收你…这个倒没什么问题。");
                command("say 但是在收你之前，我得先考察一下你的能力。");
                me->set("move_party/日月神教—梅庄", 1);
        }

        if ((int)me->query("combat_exp") < 200000)
        {
                command("sigh");
                command("say 你的江湖经验太浅，还是先多锻炼锻炼再说吧。");
                return;
        }

        if ((int)me->query_skill("force") < 120)
        {
                command("say 你内功火候太差，就算收下你，也不会有什么出息。");
                return;
        }

        command("say 不错，不错！");
        command("say 我就收下你了，不过千万别招惹是非，给我梅庄添乱。");
        command("recruit " + me->query("id"));

        if (me->query("move_party/日月神教—梅庄"))
        {
                me->delete("move_party/日月神教—梅庄", 1);
                command("say 现在你成为我梅庄中人，望你专心练武，别再去过问教中事物。");
        }
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/fenglei-zifa/she"))
                return "我已经教过你了，自己下去练，别老是跟我纠缠不休。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("fenglei-zifa", 1) < 1)
                return "你连风雷子法都没学，何谈此言？";

        if (me->query("gongxian") < 300)
                return "你对本庄所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("fenglei-zifa", 1) < 100)
                return "你的风雷子法还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "微微一笑，随手拈起一颗棋子，“飕”的"
                       "弹射了出去。$N" HIY "只觉眼前一花，那颗棋子正好打"
                       "\n在自己脚跟前的青砖上，没入半尺之深。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 这一招便是风雷子法的射日，你看明白了多少？");
        tell_object(me, HIC "你学会了「射日诀」。\n" NOR);

        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("fenglei-zifa"))
                me->improve_skill("fenglei-zifa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/fenglei-zifa/she", 1);
        me->add("gongxian", -300);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/fenglei-panfa/fenglei"))
                return "我已经教过你了，自己下去练，别老是跟我纠缠不休。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("fenglei-panfa", 1) < 1)
                return "你连风雷盘法都没学，何谈此言？";

        if (me->query("gongxian") < 1000)
                return "你对本庄所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 200)
                return "你的内功火候尚不精纯，学不了这一招。";

        if (me->query_skill("fenglei-panfa", 1) < 150)
                return "你的风雷盘法还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "点了点头，将$N" HIY "招至"
                       "身边，在耳旁低声细说良久，$N" HIY "听了"
                       "半天，忽然说道：“我明白了，所谓四\n击"
                       "便是抬手似疾风、起势如骤雨、出招若雷鸣"
                       "、收势如电闪。”\n" NOR, me, this_object());

        command("haha");
        command("say 不错，不错。这就是风雷四击的奥秘，你自己下去练吧。");
        tell_object(me, HIC "你学会了「风雷四击」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("hammer"))
                me->improve_skill("hammer", 1500000);
        if (me->can_improve_skill("fenglei-panfa"))
                me->improve_skill("fenglei-panfa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/fenglei-panfa/fenglei", 1);
        me->add("gongxian", -1000);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/xuantian-zhi/bing"))
                return "我已经教过你了，自己下去练，别老是跟我纠缠不休。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("xuantian-zhi", 1) < 1)
                return "你连玄天指都没学，何谈此言？";

        if (me->query("gongxian") < 1500)
                return "你对本庄所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("xuantian-wujigong", 1) < 180)
                return "你的玄天无极功火候不够，学不了这一招。";

        if (me->query_skill("xuantian-zhi", 1) < 180)
                return "你的玄天指还练得不到家，自己下去练练再来吧！";

        message_vision( HIW "$n" HIW "点了点头，默运玄天无极功，伸出右手"
                       "食指，插入桌上的花瓶\n中。片刻间花瓶水面便浮起一"
                       "丝丝白气，过不多时，瓶口上起了一层\n白箱，跟着水"
                       "面结成一片片薄冰，冰越结越厚，只一盏茶时分，整个"
                       "\n花瓶内的清水都化成了寒冰。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 这就是玄天指绝技冰坚地狱的运功窍门，你自己下去练吧。");
        tell_object(me, HIC "你学会了「冰坚地狱」这一招。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("xuantian-wujigong"))
                me->improve_skill("xuantian-wujigong", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("xuantian-zhi"))
                me->improve_skill("xuantian-zhi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xuantian-zhi/bing", 1);
        me->add("gongxian", -1500);

        return 1;
}

mixed ask_qipan()
{
        object me;
        object ob;

        me = this_player();

        if (me->query("family/family_name") != "梅庄")
                return "你和本庄素无渊源，打听它干什么？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才配使用这玄铁棋盘。";

        if (me->query_skill("fenglei-panfa", 1) < 150)
                return "你还是下去将你的风雷盘法练练再来吧。";

        if (me->query_skill("chess", 1) < 100)
                return "你连奕棋都不会，用我这宝贝干嘛？";

        if (present("xuantie qipan", me))
                return "现在玄铁棋盘不就在你身上吗，怎么老是跟我纠缠不休？";

        ob = present("xuantie qipan", this_object());

        if (! objectp(ob))
                return "现在玄铁棋盘已经不在我这里了。";

        ob->move(this_object());
        command("give xuantie qipan to " + me->query("id"));

        ob = new("/d/meizhuang/obj/qipan");
        ob->move(this_object());
        ob->wield();

        return "很好，既然这样，我这玄铁棋盘你就暂时拿去用吧。";
}

int accept_object(object me, object ob)
{
        int r;
        if (r = ::accept_object(me, ob))
                return r;

        if (base_name(ob) != QIPAN)
        {
                command("say 你给我这种东西干什么？");
                return 0;
        }

        if (me->query("family/master_id") != query("id"))
                command("say 多谢这位" + RANK_D->query_respect(me) +
                        "将我的宝贝交回。");
        else
                command("say 很好，很好！");
        destruct(ob);
        return 1;
}

void unconcious()
{
        die();
}
