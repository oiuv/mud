#include <ansi.h>
inherit NPC;

void create()
{
        set_name("哈萨克人", ({ "hasake ren", "hasake", "ren"}));
        set("gender", "男性");
        set("age", 26);
        set("long", "一个哈萨克族青年，赶着几十只羊。\n");
        set("attitude", "friendly");
        set("combat_exp", 4000);
        set("shen_type", 0);
        set("str", 32);
        set("int", 18);
        set("con", 22);
        set("dex", 17);
        set("max_qi", 600);
        set("max_jing", 600);
        set("neili", 600);
        set("max_neili", 600);
        set("jiali", 50);
        set_skill("unarmed", 50);
        set_skill("blade", 50);
        set_skill("parry", 50);
        set_skill("dodge", 50);
        set_temp("apply/attack", 25);
        set_temp("apply/defense", 25);
        set_temp("apply/damage", 25);

        set("inquiry", ([
            	"苏普"   : "呀，你也要跟苏普摔跤？往东走你就会找到他。",
            	"阿曼"   : "叹，我摔跤总赢不了苏普。",
            	"计老人" : "计老人会酿又香又烈的美酒，会医牛羊马匹的疾病。",
        ]));

        set("chat_chance", 10);
        set("chat_msg", ({
		CYN "哈萨克人道：上个月我用刀砍死了一头狼，剥了狼皮送给咱阿妹。\n" NOR,
		CYN "哈萨克人道：阿曼是草原上一朵会走路的花。\n" NOR,
        }) );

        setup();
        carry_object(__DIR__"obj/duandao")->wield();
        carry_object(__DIR__"obj/ycloth")->wear();
}
