#include <ansi.h>

inherit NPC;
inherit F_MASTER;

mixed ask_me();

void create()
{
        set_name("胡逸之", ({ "hu yizhi", "hu", "yizhi" }));
        set("gender", "男性");
        set("nickname", HIR "美刀王" NOR);
        set("character", "光明磊落");
        set("age", 37);
        set("long", @LONG
这人胡子拉碴，头上裹着一围白巾，脚下踢着
一双拖鞋，全然一副乡农模样。
LONG);
        set("attitude", "peaceful");
        set("str", 36);
        set("int", 28);
        set("con", 31);
        set("dex", 33);

        set("qi", 4000);
        set("max_qi", 4000);
        set("jing", 2000);
        set("max_jing", 2000);
        set("neili", 4500);
        set("max_neili", 4500);
        set("jiali", 160);
        set("combat_exp", 2000000);

        set_skill("force", 240);
        set_skill("lengyue-shengong", 240);
        set_skill("blade", 260);
        set_skill("baisheng-daofa", 260);
        set_skill("hujia-daofa", 240);
        set_skill("dodge", 240);
        set_skill("sixiang-bufa", 240);
        set_skill("parry", 240);
        set_skill("strike", 240);
        set_skill("chuncan-zhang", 240);
        set_skill("cuff", 240);
        set_skill("hujia-quan", 240);
        set_skill("literate", 180);
        set_skill("martial-cognize", 240);

        map_skill("force", "lengyue-shengong");
        map_skill("blade", "baisheng-daofa");
        map_skill("dodge", "sixiang-bufa");
        map_skill("parry", "baisheng-daofa");
        map_skill("strike", "chuncan-zhang");
        map_skill("cuff", "hujia-quan");

        prepare_skill("strike", "chuncan-zhang");
        prepare_skill("cuff",   "hujia-quan");

        create_family("关外胡家", 13, "高手");

        set("inquiry", ([
                "百胜刀法" : (: ask_me :),
                "美刀王"   : "美刀王已经死了，还提他做甚？",
                "陈圆圆"   : "唉！我也没能和她说上几句话。",
                "陈园园"   : "唉！我也没能和她说上几句话。",
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
	        (: perform_action, "blade.heng" :),
	        (: perform_action, "cuff.kuai" :),
	        (: perform_action, "strike.jian" :),
	        (: perform_action, "dodge.fei" :),
	        (: exert_function, "recover" :),
	        (: exert_function, "powerup" :),
        }));

        setup();
        carry_object("/clone/weapon/gangdao")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

mixed ask_me()
{
        object /*ob,*/ me;

        me = this_player();
        if (me->query("family/family_name") != "关外胡家")
                return "这是在下擅长的本事，你要不要较量较量？";

        return "干嘛？你师父没教你么？";
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "横扫千军" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/baisheng-daofa/heng",
                           "name"    : "横扫千军",
                           "sk1"     : "baisheng-daofa",
                           "msg1"    : "$N微微点了点头，在$n耳旁轻声"
                                       "嘀咕了几句，随即又伸手作刀，"
                                       "左劈右斩比划演示了半天。$n在"
                                       "一旁默不做声，直到$N演示结束"
                                       "，突然双眸一亮，似乎在武学上"
                                       "又有了新的突破。",
                           "msg2"    : "这招乃是我穷集毕生精力所创，"
                                       "威力非同小可。",
                           "lv1"     : 150,
                           "force"   : 200,
                           "gongxian": 600,
                           "shen"    : 8000, ]));
                break;

        default:
                return 0;
        }
}
