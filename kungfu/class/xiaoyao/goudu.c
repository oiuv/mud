#include <ansi.h>
#include "xiaoyao.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

string ask_me();

void create()
{
	set_name("苟读", ({ "gou du", "gou", "du" }));
	set("long", "他看上去也是几十岁的人了，却是纯然一个\n"
                    "书呆子的模样。\n");
	set("title", "逍遥派函谷八友");
	set("nickname", WHT "书呆" NOR);
	set("gender", "男性");
	set("age", 50);
	set("attitude", "friendly");
	set("class", "scholar");
	set("shen_type", 1);
	set("str", 25);
	set("int", 35);
	set("con", 25);
	set("dex", 25);

	set("inquiry", ([
		"论语" : (:ask_me:),
	]) );

	set("max_qi", 1800);
	set("max_jing", 1800);
	set("neili", 2000);
	set("max_neili", 2000);
	set("jiali", 60);
	set("combat_exp", 300000);

        set_skill("force", 120);
        set_skill("xiaoyao-xinfa", 120);
        set_skill("dodge", 100);
        set_skill("feiyan-zoubi", 100);
        set_skill("strike", 100);
        set_skill("panyang-zhang", 100);
        set_skill("hand", 100);
        set_skill("qingyun-shou", 100);
        set_skill("parry", 100);
        set_skill("blade", 80);
        set_skill("ruyi-dao", 80);
        set_skill("literate", 220);
        set_skill("martial-cognize", 80);

	map_skill("force", "xiaoyao-xinfa");
	map_skill("dodge", "feiyan-zoubi");
	map_skill("hand", "qingyun-shou");
	map_skill("strike", "panyang-zhang");
	map_skill("parry", "panyang-zhang");
	map_skill("blade", "ruyi-dao");

        prepare_skill("hand", "qingyun-shou");
        prepare_skill("strike", "panyang-zhang");

        set("coagents", ({
                ([ "startroom" : "/d/xiaoyao/muwu1",
                   "id"        : "kang guangling" ]),
                ([ "startroom" : "/d/xiaoyao/muwu2",
                   "id"        : "xue muhua" ]),
        }));

	create_family("逍遥派", 3, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hand.zhuo" :),
                (: perform_action, "strike.pan" :),
                (: exert_function, "recover" :),
        }));

	set("book_count", 1);

	setup();
	carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->query_int() < 26)
        {
                command("say 这个…你的头脑太不开窍…怎么能够逍遥？");
                return;
        }

        command("say 甚好，甚好！");
        command("say 有徒至远方来，不矣乐呼。");
        command("recruit " + ob->query("id"));
}

string ask_me()
{
	object me, ob, book;

	ob = this_player(); 
        me = this_object();

        if (ob->query("family/family_name") != "逍遥派")
                return "干嘛你要？";

	if (ob->query("family/master_id") == "wuya zi" ||
           ob->query("family/master_id") == "su xinghe")
	{
		call_other("/clone/book/lbook4", "???");
                book = find_object("/clone/book/lbook4");
                if (! objectp(book) || environment(book))
                        return "你来晚了，那本《论语》我已经赠送给别入了。";

		command("say 想要这本论语么？你只管拿去就是。");
		message_vision(HIY "$N" HIY "从怀里掏出一本旧书，交了给$n"
                               HIY "。\n" NOR, me, ob);
	        book->move(ob, 1);
		return "这本书可千万不要借给别人啊，他们一借就不还的了。\n";
	}

        if (query("book_count") < 1)
                return "我现在手头没有什么书了。";

        add("book_count", -1);
	command("say 哈哈，论语就没有了，这里有我派高手从少林盗来的书。");
	command("say 既然你那么好学，我就把它送给你吧。");
	message_vision(HIY "$N" HIY "翻箱倒柜找了半天，找出一本旧书，交了给$n"
                       HIY "。\n" NOR, me, ob);
	if (random(2) == 1)
                book = new("/clone/book/strike_book");
	else
                //book = new("/clone/book/quanpu");
                book = new("/clone/book/hand_book");
	book->move(ob, 1);

	return "这本书可千万不要借给别人啊，他们一借就不还的了。\n";
}
