#include <ansi.h>
#include "taohua.h"

inherit NPC;
inherit F_MASTER;

mixed ask_me();
mixed ask_skill1();

void create()
{
        set_name( "冯默风" ,({ "feng mofeng", "feng", "mofeng" }));
        set("gender", "男性");
        set("age", 39);
        set("long", "冯默风是黄药师最小的一个徒弟，他的根基不错，但性子\n"
                    "较为愚鲁。他的基本功扎实，一副忠厚老实的样子。\n");
        set("attitude", "friendly");
        set("class", "scholar");
        set("str", 30);
        set("int", 24);
        set("con", 27);
        set("dex", 23);
        set("shen_type",1);
        set("max_qi", 4200);
        set("max_jing", 2100);
        set("neili", 4500);
        set("max_neili", 4500);
        set("jiali", 100);
        set("combat_exp", 800000);

        set_skill("force", 180);
        set_skill("luoying-xinfa", 180);
        set_skill("unarmed", 160);
        set_skill("xuanfeng-tui", 160);
        set_skill("strike", 160);
        set_skill("pikong-zhang", 160);
        set_skill("finger", 140);
        set_skill("canglang-zhi", 140);
        set_skill("dodge", 160);
        set_skill("parry", 160);
        set_skill("sword", 160);
        set_skill("luoying-shenjian", 160);
        set_skill("literate", 140);
        set_skill("martial-cognize", 140);

        map_skill("force", "luoying-xinfa");
        map_skill("unarmed", "xuanfeng-tui");
        map_skill("strike", "pikong-zhang");
        map_skill("finger", "canglang-zhi");
        map_skill("dodge", "xuanfeng-tui");
        map_skill("parry", "luoying-shenjian");
        map_skill("sword", "luoying-shenjian");

        prepare_skill("unarmed", "xuanfeng-tui");
        prepare_skill("strike", "pikong-zhang");

        create_family("桃花岛", 2, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.sui" :),
                (: perform_action, "finger.tao" :),
                (: perform_action, "strike.dai" :),
                (: perform_action, "unarmed.kuang" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }));

        set("chat_chance", 1);
        set("chat_msg", ({
            	CYN "冯默风说道：师父疼爱小师妹，他的软猬甲一直由小师妹穿着。\n" NOR,
            	CYN "冯默风自言自语地说道：家师所布置的这个桃花阵真是不简单！\n" NOR,
        }));

        set("inquiry", ([
           	"拜师" : (: ask_me :),
           	"投师" : (: ask_me :),
           	"东邪" : "家师人称东邪！呵呵。",
           	"西毒" : "欧阳锋是与家师并世齐名的高手，人称老毒物。",
           	"南帝" : "听家师说段王爷现在出家当了和尚，法名一灯。",
           	"北丐" : "北丐洪七公是丐帮帮主，现在扬州城外。",
           	"黄蓉" : "她是师父的爱女。",
           	"黄药师" : "你要拜访家师？",
           	"桃花岛" : "这儿就是桃花岛，你若不是本派弟子，要过桃花阵。",
           	"桃花阵" : "往南就是了。",
           	"碧浪滔天" : (: ask_skill1 :),
        ]));
        setup();
        carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/weapon/changjian");
}

void attempt_apprentice(object ob)
{
        string master;
        if (! permit_recruit(ob))
                return;
        
        if (stringp(master = ob->query_temp("taohua/master")))
        {
                if (master != name())
                {
                        command("say 家师不是让你拜" + master + "的吗？你怎么来"
                                "找我来了？");
                        return;
                }

                command("say 好吧，既然家师有令，我就收下你了，不过要好好遵守桃"
                        "花岛的规矩。");
                command("recruit " + ob->query("id"));
                ob->delete_temp("taohua/master");
                return;
        }

        command("shake");
        command("say 我可不敢擅自收徒，你还是找家师黄岛主吧！");
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/canglang-zhi/tao"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，问这个干嘛？";

        if (me->query_skill("canglang-zhi", 1) < 1)
                return "你连沧浪指法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 50)
                return "师父吩咐过，不传功给无功劳的弟子。";

        if (me->query_skill("force") < 120)
                return "你的内功修为不够，还是多锻炼锻炼吧。";

        if (me->query_skill("canglang-zhi", 1) < 80)
                return "你的沧浪指法还不够熟练，练高了再来找我。";

        message_sort(HIY "\n$n" HIY "点了点头，道：“既然家师吩咐过，今日我就"
                     "传你这招，可要看好了。”说完只见$n" HIY "陡然伸出一指，"
                     "纷翻不定，顿听指气嗤然作响，全全笼罩$N" HIY "四周。\n\n"
                     NOR, me, this_object());

        command("nod");
        command("say 看懂了吗？");
        tell_object(me, HIC "你学会了「碧浪滔天」。\n" NOR);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("canglang-zhi"))
                me->improve_skill("canglang-zhi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/canglang-zhi/tao", 1);
        me->add("gongxian", -50);

        return 1;
}

mixed ask_me()
{
        object me;
        me = this_player();

        if (me->query("family/family_name"))
        {
                if (me->query("family/family_name") != "桃花岛")
                {
                        command("say 阁下已有门派，家师是不会收留你的，请走吧！");
                        return 1;
                }

                if (me->query("family/master_name"))
                {
                        command("say 你不是已经入了我们桃花岛吗？");
                        return 1;
                }
        }

        if (me->query("detach/桃花岛"))
        {
                command("say 当年你离开了桃花岛，今天还敢回来见家师？");
                return 1;
        }

        if (me->query("betrayer/times"))
        {
                command("say 你这判师之人，家师是绝对不会收你为徒的！");
                return 1;
        }
        command("say 好吧，我带你过桃花阵，你自己去找黄岛主吧。");
        message_vision(HIW "\n$N" HIW "大步的向南走去，$n" HIW "紧随其后。\n\n" NOR,
                       this_object(), me);
        this_object()->move("/d/taohua/damen");
        me->move("/d/taohua/damen");
        command("say 好了，我带你到大门，你进去就可以见到家师。");
        message_vision("$N头也不回的往北面离去。\n", this_object());
        this_object()->move(query("startroom"));
        message_vision("$N急匆匆的走了过来。\n", this_object());
        return 1;
}

void unconcious()
{
        die();
}
