// luban.c 鲁班
// Written by Doing Lu 1998/11/17
// 鲁班是负责建造房间的NPC， 首先，玩家去鲁班那里索要图纸，然后到想建房
// 的地点描绘图纸，必须要有30级以上的绘画技巧才可以，如果不到30级，可以
// 和鲁班学习。然后玩家要把图纸给鲁班，鲁班询问房屋的名称，不能和那里已
// 有的房屋重名，然后再询问房屋的类型（房屋的类型都定义在roomtype.h）中，
// 并且询问每个房间的描述，每个描述不能超过三百二十个字符（即最多四行），
// 其中所有的房间的short 都由房屋名称生成，不需要玩家输入，然后鲁班记录
// 所有的信息，并提示玩家等待巫师（权限在arch以上）的批准。
//
// 巫师上线后到鲁班处，鲁班提示巫师处理玩家的信息，如果巫师批准了，就更
// 新信息，等玩家再上线后到鲁班处，鲁班提示玩家可以建房（如果没有被批准，
// 就显示原因，清除信息），玩家交一定的费用，就可以生成房屋文件，并修改
// 玩家的档案，记录玩家已经建过房，并赠送一把钥匙，然后清除记录的信息。
//
// 如果玩家丢了钥匙，可以到鲁班处重新配一把钥匙，如果玩家需要复制钥匙，
// 也可以向鲁班要求。
//
// 如果玩家需要拆除房屋，可以向鲁班提出，经过确认后，删除房屋档案。

// 生成房屋的说明
// 在选择好房屋类型时，鲁班将纪录需要建设的房屋原型的所有文件，这些文件
// 一定要在/d/room/XXXX/内，比如玩家选用了独乐居，则房屋文件都在/d/room
// /dule/内。在生成房屋文件时，鲁班将把这些文件拷贝到/data/room/playerid/，
// 同时原型房屋必须由一个出口：/d/room/xiaoyuan鲁班将将这个出口替换成玩
// 家建房的地点，所以原型房还必须有一个以xiaoyuan命名的小院。
//
// 对于原型房还有一些其他要求，比如原型房继承的是ROOM类型，而建造的房将
// 继承PRIVATE_ROOM类型，因此在原型房的文件中，inherit ROOM那一句要求包
// 含有/**/的字样，或是/* EXAMPLE */，而在inhert PRIVATE_ROOM之前需要有
// //**的字样，因为鲁班会自动的将包含/**/的行去掉，并去掉//**的字样。另
// 外，所有有门的原型房，都必须有以下语句，set ("key", "ROOM_KEY");这是
// 为了给建好的房子添加钥匙。同时原型房中最好有主人set ("room_owner",
// "ROOM_OWNER")和类型的设置。

// 关于钥匙的一点说明
// 每个玩家房屋钥匙要生成一个文件，其实这完全可以用一个通用的钥匙文件在
// 每次AUTOLOAD的时候自动的更新，之所以不这么做是因为为了使玩家的房屋数
// 据能够保持一个独立性，不至于过于分散，而且在一个人身上带多把钥匙的时
// 候不至于过于繁琐。

// 一些变量的说明
// 玩家在商谈时纪录的数据
// contract/luban          : 纪录商谈数据的mapping，这记录在玩家的临时变量
// contract/luban/room     : 纪录房屋描述信息的mapping
// contract/luban/descs    : 纪录房屋描述的mapping
// contract/luban/questing : 玩家商谈状态 quest_name/quest_id/quest_desc
// contract/luban/value    : 建设房屋所需要的价格(以coin为单位)
// contract/luban/position : 建造房屋的地点

// 鲁班记录玩家申请的数据
// form : 记录玩家申请的表单
// form/player/player   : 申请者的名称
// form/player/position : 申请建房的地点
// form/player/room     : 申请建房的类型名称
// form/player/type     : 申请建房的类型代号
// form/player/name     : 房屋的名称
// form/player/id       : 房屋的代号
// form/player/status   : 表单的状态 - 申请/允许/拒绝
// form/player/time     : 申请的时间
// form/player/wizard   : 处理表单的巫师
// form/player/memo     : 巫师填写的备注
// form/player/descs    : 玩家填写的描述

// 玩家自身数据的修改
// private_room/build   : 已经建过房屋
// private_room/position: 房屋所在的位置，即入口处所在场景的文件路径
// private_room/entry   : 房屋入口处的文件路径
// private_room/name    : 房屋名称
// private_room/id      : 房屋ID
// private_room/type    : 房屋类型名称

// 实现方法
// 商谈过程是一个简单的自动机，其状态储存在用户的数据结构中的contract/
// luban字段，接收消息的函数是do_answer， 这个函数根据状态处理接收的消
// 息即字符串，最要是调用不同的判断函数，如果返回1则已记录输入的信息，
// 如果返回0则表示不与处理或是终止商谈。如果用户在商谈过程输入了stop，
// 则清除自动机的状态和用户数据库中记录的商谈信息。

// 数据存放
// 阶段1 - 商谈
// 数据存放在player->contract/luban/这个mapping中

// 阶段2 - 申请
// 数据存放在luban->form/player/这个mapping中

// 阶段3 - 建设完毕
// 数据存放在player->private_room/这个mapping中
// 生成的文件存放在/data/room/player/这个目录中
// 玩家房屋的存盘文件存放在/data/room/player/这个目录中
// 建房处的存盘文件存放在相同的目录中，不过后缀不一样

// 相关文件
// inherit::PRIVATE_ROOM(/inherit/room/privateroom.c)
// 这是用户建造的房屋所具有的属性，主要是用钥匙开门和存放物品
//
// inherit::BUILD_ROOM(/inherit/room/buildroom.c)
// 这是建房处的环境所具有的属性，主要是可以记录增加的出口，并修改LONG描述

#include <ansi.h>

inherit	NPC;
inherit	F_SAVE;

// 这里记录了各种样式房屋
// 这里是一个mapping数组，其中每一个mapping指明了一种型号的房屋。 每一个mapping中有三个
// 元素，一是名字、二是类型、三是房屋字符串数组：字符串数组指明了这种房屋所拥有的文件。
// files中的必须有一个是入口文件(既有到/d/room/xiaoyuan的出口)，否则建房时将产生错误。

// 另外：type 和 name 都可以作为房屋类型的标志，只不过一个是中文，另一个是英文的而已，
// 在最终保存在玩家数据库中的是中文的类型名即name字段。

// 注意：由于鲁班是一个需要保存数据的NPC，在改动鲁班的文件后可能会发生一些问题，这时可以
// 将他的存盘文件删除。
STATIC_VAR_TAG mapping *room_example = ({
([	"name"	   : "独乐居",
	"type"	   : "dule",
	"value"	   : 20000000,
	"files"	   : ([	"xiaoyuan" : "/d/room/dule/xiaoyuan.c",
			"xiaowu"   : "/d/room/dule/dulewu.c" ,
		     ]),
]),
([	"name"	   : "彩虹居",
	"type"	   : "caihong",
	"value"	   : 70000000,
	"files"	   : ([ "xiaoyuan" : "/d/room/caihong/xiaoyuan.c",
			"dating"   : "/d/room/caihong/dating.c",
			"houyuan"  : "/d/room/caihong/houyuan.c",
			"woshi"    : "/d/room/caihong/woshi.c",
		     ]),
]),
([	"name"	   : "盘龙居",
	"type"	   : "panlong",
	"value"	   : 800000000,
	"files"	   : ([ "dayuan"   : "/d/room/panlong/dayuan.c",
                        "qianting" : "/d/room/panlong/qianting.c",
                        "zuowei"   : "/d/room/panlong/zuowei.c",
                        "youwei"   : "/d/room/panlong/youwei.c",
                        "zoudao"   : "/d/room/panlong/zoudao.c",
                        "yingke"   : "/d/room/panlong/yingke.c",
                        "chashi"   : "/d/room/panlong/chashi.c",
                        "yishi"    : "/d/room/panlong/yishiting.c",
                        "zuoyanwu" : "/d/room/panlong/yanwu1.c",
                        "youyanwu" : "/d/room/panlong/yanwu2.c",
                        "zhongting": "/d/room/panlong/zhongting.c",
                        "zuoxiang" : "/d/room/panlong/zuoxiang.c",
                        "youxiang" : "/d/room/panlong/youxiang.c",
                        "houyuan"  : "/d/room/panlong/houyuan.c",
                        "chufang"  : "/d/room/panlong/chufang.c",
                        "wuchang"  : "/d/room/panlong/lianwu.c",
                        "huayuan"  : "/d/room/panlong/huayuan.c",
                        "zhulin"   : "/d/room/panlong/zhulin.c",
                        "tingtao"  : "/d/room/panlong/tingtao.c",
                        "jusuo"    : "/d/room/panlong/jusuo.c",
                        "shufang"  : "/d/room/panlong/shufang.c",
                        "woshi"    : "/d/room/panlong/woshi.c",
		     ]),
]),

});

#define	WIZLEVEL	4	// 能够处理表单的巫师等级

STATIC_VAR_TAG string *ban_room_id = ({
        "north",
        "south",
        "east",
        "west",
        "northup",
        "southup",
        "eastup",
        "westup",
        "northdown",
        "southdown",
        "eastdown",
        "westdown",
        "northeast",
        "northwest",
        "southeast",
        "southwest",
        "up",
        "down",
        "enter",
        "out",
});

// 内部函数
private int	ask_me();
private int	ask_paper();
private int	ask_drawing();
private int	ask_certosina();
private int	ask_demolish();
private int	ask_rebuild();
private int	ask_modify();
private int	ask_key();
private int	ask_desc();
private int	recognize_apprentice(object me);
private int	accept_object(object me, object ob);
private void    tell_user_status(object me);
private void	luban_say(string msg);
private void	user_say(string msg);
private int	do_answer(string arg);
private int	do_stop();
private int	do_desc(string arg);
private int	do_show(string arg);
private int	do_changename(string arg);
private int	do_changeid(string arg);
private int	do_changetype(string arg);
private int	do_changedesc(string arg);
private int	do_finish();
private int	do_withdraw();
private int	decide_withdraw();
private int	do_destory();
private void	show_desc(mixed player, string arg);
private void    promote_type(object me);
private int	quest_user(object me);
private int	quest_info(object me);
private int	check_name(object me, string arg);
private int	check_id(object me, string arg);
private int	check_type(object me, string arg);
private int	check_legal_name(string name, string position);
private int	check_legal_id(string name, string position);
private mixed	check_legal_type(string type);
private string	obey_description(string desc);
private object	get_object(string file_name);
private int	record_desc(object me, string room_name, string desc);
private void	record_contract(object me);
private int	modify_desc_in_form(string player_id, string room_name, string desc);
private string	sort_desc(mixed me, string desc);

// 巫师使用的管理命令相关的函数
private void	show_brief(string player_id);
private int	exist_form();
private int     do_help(string arg);
private int	do_list(string arg);
private int	do_type(string arg);
private int	do_agree(string arg);
private int	do_reject(string arg);
private int	do_delete(string arg);
private void	show_apply();
private void	show_agree();
private void	show_reject();
private void	show_old();
private void    show_all();
private void	show_brief_title();
private void	show_brief_list(string info, string msg);

// 生成/拆毁房屋的相关函数
private string  file_dir(mixed me);
private string	to_player(string player_id, string file_name);
private void	create_room(object me);

// 下面这个函数将提供给外部调用(/adm/daemons/updated)，用于更新玩家
// 的数据(数据故障或是玩家自杀，被PURGE)
int     demolish_room(object me);

// 生成钥匙的函数
private int     create_new_key(object me);
private object  get_user_key(object me);

mapping* forms;
mapping my_form;	// 一个表单，用来存放用户提交的建房信息

// 这是提供的函数，之所以用宏定义，仅仅是为了减小运行时的开销
// 查询form
#define	query_form(pid, item)		query("form/" + pid + "/" + item)
// 设置form内的值
#define set_form(pid, item, content)	set("form/" + pid + "/" + item, content)
// 判断该玩家是否有提交申请
#define submit_form(pid)		mapp(query("form/" + pid))

void create()
{
        seteuid(getuid());
        restore();

	set_name("鲁班", ({ "lu ban", "lu", "luban" }));
	set("title", "天下第二巧匠");
	set("nickname", HIC "鬼斧神工" NOR);
	set("shen_type", 0);

	set("str", 10000);		// 防止接收的东西过多而导致丢失
	set("int", 60);

	set("gender", "男性");
	set("age", 1450);
	set("long",@LONG
这就是号称天下第二巧匠的建筑大师公输班，不论是造什么样子房屋，在
他手下都不是问题。
LONG
);
	set("attitude", "friendly");
	set("inquiry", ([
		"造房"	: (: ask_me :),
		//"造屋"	: (: ask_me :),
		"买房"	: (: ask_me :),
		//"买屋"	: (: ask_me :),
		"建房"	: (: ask_me :),
		//"建屋"	: (: ask_me :),
		"房子"	: (: ask_me :),
		//"屋子"	: (: ask_me :),
                "home"  : (: ask_me :),
		"room"	: (: ask_me :),
		"house"	: (: ask_me :),
		"图纸"	: (: ask_paper :),
		"纸张"	: (: ask_paper :),
		"纸"	: (: ask_paper :),
		"paper"	: (: ask_paper :),
		//"拆屋"  : (: ask_demolish :),
		"拆房"  : (: ask_demolish :),
		"拆毁"  : (: ask_demolish :),
                "demolish": (: ask_demolish :),
                "destroy" : (: ask_demolish :),
		"重建"  : (: ask_rebuild :),
		//"再建"  : (: ask_rebuild :),
		"钥匙"	: (: ask_key :),
		//"锁匙"	: (: ask_key :),
		//"锁钥"	: (: ask_key :),
                "配钥匙": (: ask_key :),
                //"配锁匙": (: ask_key :),
                "新钥匙": (: ask_key :),
                //"新锁匙": (: ask_key :),
		"key"	: (: ask_key :),
		"描述"	: (: ask_desc :),
		"描写"	: (: ask_desc :),
		"desc"	: (: ask_desc :),
		"规则"	: (: ask_desc :),
		"修改"  : (: ask_modify :),
		"修正"  : (: ask_modify :),
		"改正"  : (: ask_modify :),
		"修改信息": (: ask_modify :),
		"绘画"    : (: ask_drawing :),
		//"画"      : (: ask_drawing :),
		"画图"    : (: ask_drawing :),
		"画画"    : (: ask_drawing :),
		"绘画技巧": (: ask_drawing :),
		"drawing" : (: ask_drawing :),
		"镶嵌"    : (: ask_drawing :),
		"镶嵌技术": (: ask_certosina :),
		"镶嵌技艺": (: ask_certosina :),
		"certosina": (: ask_certosina :),
	]));
	
	set_skill("literate",  120);            // 读书写字
	set_skill("drawing",   500);            // 绘画技巧
	set_skill("certosina", 500);            // 镶嵌技艺

        set("no_teach", ([
                "literate" : "我可不是教书先生。",
        ]));

	setup();
	carry_object("/clone/misc/cloth")->wear();

        move("/d/room/xiaoyuan");
        set("startroom", base_name(environment()));
}

// 毁灭时保存进度
void remove()
{
        save();
}

void init()
{
	object me;
	
	::init();

	if (interactive(me = this_player()))
	{
		remove_call_out("greeting");
		call_out("greeting", 1, me);
	}

	me->delete_temp("decide_withdraw");
	me->delete_temp("demolish_room");

	add_action("do_stop", "stop");
	add_action("do_answer", "answer");
	add_action("do_desc", "desc");
	add_action("do_show", "show");
	add_action("do_changename", "changename");
	add_action("do_changeid",   "changeid");
	add_action("do_changetype", "changetype");
	add_action("do_changedesc", "changedesc");
	add_action("do_finish", "finish");
	add_action("do_finish", "ok");
	add_action("do_withdraw", "withdraw");
	add_action("do_withdraw", "chexiao");
	add_action("decide_withdraw", "decide");
	add_action("do_demolish", "demolish");

	// 如果来的是有资格处理表单的巫师就增加处理表单的命令
	if (wizardp(me) && wiz_level(me) >= WIZLEVEL)
	{
                add_action("do_help", "help");
		add_action("do_list", "list");
		add_action("do_type", "type");
		add_action("do_agree", "agree");
		add_action("do_reject", "reject");
		add_action("do_delete", "delete");
	}
}

// 存盘文档
string query_save_file()
{
        return "/data/npc/luban";
}

void greeting(object me)
{
	if (!objectp(me) || environment(me) != environment())
		return;

	// 对巫师提示的信息
	if (wizardp(me) && wiz_level(me) >= WIZLEVEL)
	{
		if (query("form") && sizeof(query("form")) >= 1)
		{
			message_vision("鲁班对$N道，来的正好，我这里有"
                                       "些单子正要处理呢。\n", me);
			tell_object(me, HIG "鲁班告诉你：请用" HIW "list" HIG "察看，" +
				        HIW "type" HIG "显示详细信息，" HIW "agree" HIG +
					"同意，" HIW "reject" HIG "拒绝，" HIW "delete" HIG
                                        "删除表单。\n            使用" HIW "help" HIG
                                        "可以查看上述命令的说明和使用帮助。\n" NOR);
		} else
			message_vision("鲁班对$N点点头，道：公输班正在授课，不及远迎，失礼了！\n", me);
		return ;
	} else
	if (query("form/" + me->query("id")))
	{
                tell_user_status(me);
	} else
	// 对玩家提示的信息
	if (me->query_temp("contract/luban"))
	{
		message_vision("鲁班对$N笑道：这位" +
                               RANK_D->query_respect(me) +
			       "，刚才怎么谈着谈着就走了？若是有"
                               "意，咱们继续谈嘛。\n", me);
	} else
	switch(random(3)) {
	case 0 :
		message_vision("鲁班对$N说道：这位" +
                               RANK_D->query_respect(me) +
			       "，可是对建房有兴趣？\n", me);
		break;
	case 1 :
		message_vision("鲁班对$N笑道：这位" +
                               RANK_D->query_respect(me) + "，行走江湖"
			       "，若是没有个落脚之处怎么行啊！\n", me);
		break;
	case 2 :
		message_vision("鲁班对$N一拱手，说道：这位" +
                               RANK_D->query_respect(me) +
			       "，很久没见啊，别来无恙？\n", me);
		break;
	}
}

// 认证学习
int recognize_apprentice(object me)
{
	if (me->query_temp("mark/鲁班") &&
            ! me->query_temp("learnd_from/鲁班"))
        {
		message_vision("鲁班对$N说：好，你既然有心学，我就"
                               "教你一点吧。\n", me);
                me->set_temp("learnd_from/鲁班", 1);
        }

	me->set_temp("mark/鲁班", 1);
	return 1;
}

// 接受物品：图纸
int accept_object(object me, object ob)
{
        object room;
	object build;		// 建房的地点

	if (ob->id("key") && ob->query("item_make"))
	{
		// 如果接收的是钥匙，就收下
		message_vision("$N把" + ob->name() + "递给了鲁班，鲁班"
                               "点点头，接过来随手把它扔到了一边的箱子"
                               "里。\n", me);
                destruct(ob);
		return 1;
	}

        if (ob->query("money_id") && me->query_temp("ask_for_key") &&
            mapp(me->query("private_room")))
        {
                room = get_object(me->query("private_room/entry"));
                if (! room)
                {
                        message_vision("鲁班扰扰头，苦恼的对$N道：我怎么"
                                       "找不到你的家呢？怪事。\n", me);
                        me->delete_temp("ask_for_key");
                        return 0;
                }
                        
                if (ob->value() >= 50000)
                {
                        message_vision("鲁班道：好！不过钥匙换了以后，"
                                       "以前的钥匙可就全都作废啦。\n", me);
                        me->delete_temp("ask_for_key");
                        if (create_new_key(me));
                        {
                                destruct(ob);
                                return 1;
                        }
                        return 0;
                } else
                if (ob->value() >= 1000)
                {
                        object ko;

                        me->delete_temp("ask_for_key");
                        ko = get_user_key(me);
                        if (ko)
                        {
	                        message_vision("鲁班拿出一把钥匙，递给"
                                               "$N道：诺！钥匙配好了，"
                                               "你把它收好！\n", me);
                                ko->move(me);                                
                                destruct(ob);
                                return 1;
                        }

                        message_vision("鲁班疑惑道：奇怪，我找不到钥匙"
                                       "的原型，你问一下巫师吧。\n", me);
                        return 0;
                }
                message_vision("鲁班看了看$N的钱，皱眉道：你这点钱干什"
                               "么也不够啊！\n", me);
                return 0;
        }

	if (ob->id("paper of drawing"))
	{
		if (mapp(me->query("private_room")))
		{
			message_vision("鲁班呵呵笑道：莫非你有一处住房还是不够？\n", me);
			return 0;
		}
		// 这是为了防止出现不正确的build_room的标记
		me->delete("private_room");

		if (query("form/" + me->query("id")))
		{
			message_vision("鲁班笑道：慌甚！你不是已经提交"
                                       "了申请么？可以用show察看申请。\n", me);
			return 0;
		}
		if (me->query_temp("contract/luban"))
		{
			message_vision("鲁班疑惑的对$N说道：干什么？刚"
                                       "才不是给过我了么？若是有什么想"
                                       "法，可以改日再谈(stop)。\n", me);
			return 0;
		}

		if (! ob->query("draw"))
		{
			message_vision("鲁班看了一下，对$N说道：你给我"
                                       "一张白纸干什么？你要是不会就和"
                                       "我学学绘画技巧(drawing)吧。\n", me);
			return 0;
		}

		if (ob->query("draw/info") == "unknow")
		{
			message_vision("鲁班接过图纸，看了半天，问$N道"
                                       "：你这画的是什么东西？你要是不"
                                       "会跟我学学绘画技巧(drawing)。\n", me);
			return 0;
		}

                if (ob->query("draw/type") != "风景")
                {
                        message_vision("鲁班对$N叹道：我说你建房得把那"
                                       "地方画给我看啊，你现在画" +
                                       ob->query("draw/type") +
                                       "给我有什么用？\n", me);
                        return 0;
                }

		message_vision("鲁班接过图纸看了看，对$N笑道："
                               "画的还行，马马虎虎吧。\n", me);			

		build = get_object(ob->query("draw/info"));
		if (! objectp(build))
		{
			message_vision("鲁班仔细看了看，叹了口气说道："
                                       "那个地方现在好像已经不存在了.."
                                       ".\n", me);
			return 0;
		}

		if (! build->is_build_room())
		{
			message_vision("鲁班仔细看了看，不禁皱了皱眉，"
                                       "对$N说道：那个地方好像不能建房"
                                       "吧...\n", me);
			return 0;
		}

                if (build->query("max_room") &&
                    (int)build->query("max_room") <= build->query_room_count())
                {
                        message_vision("鲁班看完了以后沉思片刻，对$N道"
                                       "：那个地方的房屋已经太多了，我"
                                       "看你就算了吧！\n", me);
                        return 1;
                }

		me->set_temp("contract/luban/position", ob->query("draw/info"));
                destruct(ob);
		quest_user(me);
		return 1;
	}

	// 看看是否填写了表单
	if ((ob->query("money_id") || ob->id("fee free card")) &&
            mapp(query("form/" + me->query("id"))))
	{
                int value;

		if (query("form/" + me->query("id") + "/status") != "同意")
		{
			message_vision("鲁班摇摇头，对$N道：巫师还没有"
                                       "批准你的申请，你先请回吧。\n", me);
			return 0;
		}

                value = query("form/" +me->query("id") + "/value");
		if (ob->query("money_id") && ob->value() < value)
		{
			message_vision("鲁班接过" + ob->name() + "掂了"
                                       "掂，对$N呵呵笑道"
                                       "：这钱似乎不够吧？\n", me);
			return 0;
		}

                if (ob->id("fee free card") &&
                    ob->query("fee free") < value)
                {
			message_vision("鲁班接过免费卡看了一会儿对$N笑"
                                       "道：真是抱歉，不过这卡还不够购"
                                       "买这间房！\n", me);
			return 0;
                }

                message_vision("鲁班接过" + ob->name() + "，对$N道："
                               "好！马上就好！\n", me);
                destruct(ob);
		create_room(me);
		return 1;
	}

	// 看看是否够手续费
	if (ob->query("money_id") || ob->id("fee free card"))
	{		
		if (me->query_temp("contract/luban/questing") != "quest_desc")
		{
			message_vision("鲁班微微一笑，对$N道：干什么这"
                                       "么客气？我不收无功之禄。\n", me);
			return 0;
		}
		if (ob->value() < 50000 && ! ob->id("fee free card"))
		{
			message_vision("鲁班嘿然冷笑，对$N道：五两黄金"
                                       "你都吝惜？哼哼，就算是天神亲临"
                                       "，我也不打折扣。\n", me);
			return 0;
		}
		
		//增加手续费上限判断，防止自动批准后玩家误把8万gold当手续费造成大量损失 by 薪有所属
		if (ob->value() > 100000)
		{
			message_vision("鲁班面带微笑，对$N道：您有意赞"
                     "助的话，最多给十两黄金就好啦，"
                     "再多我可不敢收。\n", me);
			return 0;
		}
		
		message_vision("鲁班接过" + ob->name() + "，在手中掂了"
                               "掂，满意的对$N说道：很好，我就给你记录"
                               "在案，若是有了消息，一定通知你。\n", me);
		record_contract(me);
		me->delete_temp("contract");

                if (ob->id("fee free card"))
                {
                        message_vision("鲁班又道：这张免费卡你先留着吧"
                                       "，建房的时候再给我。\n", me);
                        return -1;
                } else
                {
                        destruct(ob);
        		return 1;
                }
	}
	message_vision("鲁班摆摆手，对$N道：你还是自己留着吧，我可用不着。\n", me);
	return 0;
}

private void tell_user_status(object me)
{
        int value;

	// 该玩家提交了表单，根据表单的状态返回提示信息
	switch (query("form/" + me->query("id") + "/status")) {
	case "申请" :
		luban_say("巫师还没有查阅你的申请，要想查看你提"
                          "交的表单可以用show，如果想修改可以问我。\n");
		break;

	case "拒绝" :
		luban_say("你的申请被拒绝了，你可以用show查看详"
                          "情，如果想修改可以问我。\n");
		break;

	case "同意" :
                value = query("form/" + me->query("id") + "/value");
                if (! value)
                {
		        luban_say("你的申请已经被批准了，随便意思意思"
                                  "给点钱即可建房，查看详情请用show，"
                                  "如果想修改可以问我。\n");
                } else
                {
		        luban_say("你的申请已经被批准了，缴纳" +
                                  MONEY_D->price_str(value) +
                                  "即可建房，查看详情请用show，如果想"
                                  "修改可以问我。\n");
                }
		break;
	}
}

// 制作新的钥匙
private int create_new_key(object me)
{
        string key_short;
        string key_file;
        string content;
        string old_id;
        string new_id;
	mixed *file;
        object room;
        int i;
        int n;

        // 生成新钥匙
        n = 1 + (int)me->query("private_room/key_no");
        if (n <= 1) n = 2;
        key_short = file_dir(me) + "key";
        key_file = key_short + (string) (n % 100);
        content = read_file(key_short + ".c");
        if (! content)
        {
                message_vision("鲁班耸耸肩，无奈的对$N道：我帮不了你了，"
                               "钥匙的原型找不到了，你问问巫师吧。\n", me);
                return 0;
        }

        // 更新并写入钥匙的文件
        old_id = "1 of " + me->query("id");
        new_id = (string) n + " of " + me->query("id");
        content = replace_string(content, "这是原配钥匙", "这是" +
                                 me->query("name") + "第" +
                                 chinese_number(n) + "次配的钥匙");
        content = replace_string(content, old_id, new_id);
        rm(key_file + ".c");
        write_file(key_file + ".c", content);
        VERSION_D->append_sn(key_file + ".c");

        // 修正所有房屋对象
	file = get_dir(file_dir(me) + "*.c", -1);
        if (! sizeof(file))
        {
                message_vision("鲁班耸耸肩，无奈的对$N道：我帮不了你了，"
                               "你的房间我找不着了，你问问巫师吧。\n", me);
                rm(key_file + ".c");
                return 0;
        }
        for (i = 0; i < sizeof(file); i++)
        {
                if (file[i][1] <= 0)
                        // 不是文件
                        continue;

                room = get_object(file_dir(me) + file[i][0]);
                if (! room || ! room->is_private_room())
                        // 无法找到对象或者对象不是私有房间类型
                        continue;

		room->restore();
                if (! stringp(room->query("room_key")))
                        // 该房间不需要钥匙
                        continue;

                // 设置新钥匙
                room->set("room_key", new_id);
                room->save();

                // 提示信息
                message("vision", @LONG
一个垂髫童子拎着箱子走了过来，摸出工具，三下五除二，你还没能
明白过来是怎么回事，他就“咔咔”几下把锁换掉了，飞也似的走了。
LONG, room);

        }

        // 更新配制钥匙的信息
        me->set("private_room/key_no", n);

        clone_object(key_file)->move(me);
        message_vision("鲁班接过摸出一把钥匙递给$N，道：你就用这把钥匙吧，"
                       "锁我马上就给你换掉。\n", me);

        return 1;
}

// 复制玩家的钥匙
private object get_user_key(object me)
{
        string key_file;
//      string content;
//      object entry;
        int n;

        key_file = file_dir(me) + "key";
        n = (int)me->query("private_room/key_no");
        if (n > 1) key_file += (string) (n % 100);

        return new(key_file);
}

// 回答有关建房的信息
private int ask_me()
{
	object me;
	me = this_player();

	if (mapp(me->query("private_room")))
	{
		message_vision("鲁班点点头，对$N说道：怎么样，住得可满"
                               "意？若是不满意，可以找我重建哦。\n", me);
		return 1;
	}

        if (query("form/" + me->query("id")))
        {
                tell_user_status(me);
                return 1;
        }

	message_vision(@SAY
鲁班微一叹气，说道：想江湖儿女，一剑纵横，快意恩仇，驰骋天下，若
是没有个落脚之处怎生得了？或隐身于闹市，或遁迹于险川，你若有意何
不画张图纸给我，若是地点合适，你且挑个满意的样式，我给你建个住房。
今生今世，不再惧那风雨。
SAY , me);
	return 1;
}

// 回答有关图纸的信息
private int ask_paper()
{
	object	me;
	object	ob;

	me = this_player();

	if (is_busy())
	{
		tell_object(me, "鲁班正忙着呢，没功夫理你...\n");
		return 1;
	}

        if (mapp(me->query("private_room")) ||
            query("form/" + me->query("id")))
        {
                message_vision("鲁班翻出一张纸，递给$N道：自个儿玩去吧。\n", me);
        } else
        {
	        message_vision("鲁班点点头，对$N说道：很好，你拿这份图"
                               "纸，到了想要建房的地点，画下来(draw)拿"
                               "回给我看看。\n", me);
        }
	ob = new("/d/room/obj/paper");
	if (objectp(ob))
	{
		message_vision("鲁班翻了翻，找到一张图纸，递给了$N。\n", me);
		ob->move(me);
	} else
	{
		message_vision("鲁班翻了半天也没找到，不禁一呆，说道："
                               "怎么回事，没有了？你去找巫师问问吧！\n", me);
	}

	start_busy(4);
	return 1;
}

// 回答有关绘画技巧的信息
private int ask_drawing()
{
	message_sort("鲁班对$N说道：要想画张好点的图纸，不会"
                     "点绘画技巧是不行的，没有人天生就会作画"
                     "，都得学习，你若有意，不妨和我学学。\n",
                     this_player());
	return 1;
}

// 回答有关镶嵌技艺的信息
private int ask_certosina()
{
	message_sort("鲁班对$N说道：我这里不受理镶嵌的活儿，"
                     "不过你有兴趣的话，我可以教你一点镶嵌的"
                     "技术。\n", this_player());
	return 1;
}

// 打听拆屋的消息
private int ask_demolish()
{
	object me;

	me = this_player();
	if (me->query_temp("contract/luban"))
	{
		message_vision("鲁班对$N说：你不是要建房么，怎么还没建"
                               "好就要拆房了？真是未雨绸缪啊！\n", me);
		return 1;
	}

	if (query("form/" + me->query("id")))
	{
		message_vision("鲁班哼了一声，对$N道：你的房子还没见到"
                               "渣呢！你要是不想建了，就撤消(withdraw)"
                               "申请算了。\n", me);
		return 1;
	}

	if (! mapp(me->query("private_room")))
	{
		message_vision("鲁班哈哈大笑，对$N道：拆屋？你还没有呢"
                               "，拆什么拆！乱拆别人的屋子可是犯法的！"
                               "\n", me);
		return 1;
	}

	if (me->query_temp("demolish_room"))
	{
		message_vision("鲁班对$N说：你要是真的想拆屋，就请下决"
                               "心(demolish)！\n", me);
		return 1;
	}

	message_vision("鲁班睁大了眼睛，奇怪的看着$N，过了良久才说：你"
                       "若是真到要拆屋，就下决心吧(demolish)！\n", me);
	me->set_temp("demolish_room", 1);
	return 1;
}

// 打听重建的消息
private int ask_rebuild()
{
	object me;

	me = this_player();
	if (! mapp(me->query("private_room")))
	{
		message_vision("鲁班摇摇头，对$N说：你还没有房子呢，"
                               "谈什么重建！\n", me);
		return 1;
	}	
	message_vision("鲁班叹了口气，对$N说：你若是要重建，就先把房"
                       "拆了吧！\n", me);
	return 1;
}

// 重新配置钥匙
private int ask_key()
{
	object me;

	me = this_player();

	if (is_busy())
	{
		write("鲁班正忙着呢，没空理你...\n");
		return 1;
	}

	if (! mapp(me->query("private_room")))
	{
		message_vision("鲁班看了$N半天，才说：没有房子你要钥"
                               "匙干什么？\n", me);
		return 1;
	}

        if (me->query_temp("ask_for_key"))
        {
                message_vision("鲁班对$N怒道：你罗不罗唆，我说了配钥"
                               "匙十两纹银，换锁五两黄金！\n", me);
                return 1;
        }

        message_vision("鲁班对$N道：容易！配把钥匙十两纹银，换锁带作一"
                       "把新的钥匙五两黄金，不还价！\n", me);
        me->set_temp("ask_for_key", 1);
	return 1;
}

// 打听描述规则信息
private int ask_desc()
{
	luban_say(@INFORMATION
描述信息可以使用颜色，并且可以分行，但是最多不能超过160个汉字：

颜色的规则：
$BLK$ - 黑色		$NOR$ - 恢复正常颜色
$RED$ - 红色		$HIR$ - 亮红色
$GRN$ - 绿色		$HIG$ - 亮绿色
$YEL$ - 土黄色		$HIY$ - 黄色
$BLU$ - 深蓝色		$HIB$ - 蓝色
$MAG$ - 浅紫色		$HIM$ - 粉红色
$CYN$ - 蓝绿色		$HIC$ - 天青色
$WHT$ - 浅灰色		$HIW$ - 白色

换行：
只要在描述信息中添加一个\n就可以。比如：“这是一间小院。\n院子边上的墙很矮。”
实际看到的描述使这个样子的：
这是一间小院。
院子边上的墙很矮。

说明：
系统自动会在描述字符串的尾端加一个 $NOR$ 和 \n。因此描述最好不要以\n结束，以免
空行太多。另外，系统会自动的规范你输入的描述信息，因此你不需要在描述信息前面添
加段落起始的空格，同时也不需要在一个段落内部插入\n以实现换行，对于过长的段落系
统会自动的添加换行符。


INFORMATION );
	return 1;
}

// 打听修改的消息
private int ask_modify()
{
	object me;

	me = this_player();
	if (! submit_form(me->query("id")) &&
            me->query_temp("contract/luban/questing") != "quest_desc")
	{
		message_vision("鲁班摇摇头，对$N说：你只有描述时或是提"
                               "交了申请以后才用得着修改。\n", me);
		return 1;
	}

	message_vision("鲁班点点头，对$N说：你可以修改你提交的申请中的各种信息：\n" +
		"\n你可以通过以下指令修改房屋的各种信息：\n" +
		HIW "changename " NOR "name : 修改房屋的中文名字。\n" +
		HIW "changeid   " NOR "id   : 修改房屋的英文代号。\n" +
		HIW "changetype " NOR "type : 修改房屋的类型。\n" +
		HIW "changedesc " NOR "room desc : 修改某间房屋的描述。\n", me);
	return 1;
}

// 输出鲁班说话时的表情
private void luban_say(string msg)
{
	object me;
	me = this_player();
	message("vision", "鲁班对" + me->query("name") + "嘀嘀咕咕说了"
                "些话。\n", environment(me), ({ me }));
	tell_object(me, "鲁班说道：" + msg);
}

// 输出用户说话时的表情
private void user_say(string msg)
{
	object me;

        me = this_player();
        tell_object(me, "你对鲁班小声道：" + msg);
	message("vision", me->query("name") + "对鲁班嘀嘀咕咕说了些话。"
                "\n", environment(me), ({ me }));
}

// 用户中止商谈
private int do_stop()
{
	object me;
	me = this_player();
	if (! me->query_temp("contract/luban"))
	{
		message_vision("鲁班一脸傻样......\n", me);
		return 1;
	}
	me->delete_temp("contract/luban");
	message_vision("鲁班对$N点点头，说道：既然如此，改日再谈也不妨"
                       "。\n", me);
	return 1;
}

// 用户回答问题
// 根据当前状态做出相应的反应
private int do_answer(string arg)
{
	object me;
	string questing;

	me = this_player();
	questing = me->query_temp("contract/luban/questing");

	// 判断现在是否正在商谈
	if (! questing)
		return 0;

        if (! arg)
                return notify_fail("你回答什么啊？\n");

	switch (questing) {
	// 商谈房屋名字
	case "quest_name" :
                user_say("房屋的名字就叫" + arg + "吧！\n\n");
	        check_name(me, arg);
	        break;

	case "quest_id" :
                user_say("代号就叫" + arg + "吧！\n\n");
	        check_id(me, arg);
	        break;

        case "quest_type" :
                user_say("你觉得" + arg + "的房型怎么样？我就要这个了。\n\n");
	        check_type(me, arg);
	        break;

	default:
	        write("没人问你问题，你想回答什么？\n");
                break;
	}
	return 1;
}

// 记录用户输入的描述信息
private int do_desc(string arg)
{
	object me;
	string room_name;
	string desc;

	me = this_player();

	if (me->query_temp("contract/luban/questing") != "quest_desc")
		return 0;

	if (arg)
	{
		if (sscanf(arg, "%s %s", room_name, desc) != 2)
		{
			room_name = arg;
			desc = 0;
		}
	}
	else
	{
		show_desc(me, 0);
		return 1;
	}

	record_desc(me, room_name, desc);
	return 1;
}

// 显示用户自己输入的描述信息
private int do_show(string arg)
{
	show_desc(this_player(), arg);
	return 1;
}

// 改变房屋名字
// 分两种状态处理：商谈中或是申请中
private int do_changename(string arg)
{
	object me;
	string player_id;
	string position;

	me = this_player();
	player_id = me->query("id");

	if (submit_form(player_id))
	{
		// 正在申请
		position = query_form(player_id, "position");
		if (! check_legal_name(arg, position)) return 1;

		luban_say("好吧，就改成" + arg + "这个名字吧！\n");
		set_form(player_id, "name", arg);
		set_form(player_id, "status", "申请");
		save();
		return 1;
	} else
	if (me->query_temp("contract/luban/questing") != "quest_desc")
		return 0;

	// 正在商谈
	if (check_legal_name(arg, me->query_temp("contract/luban/position")))
	{
		me->set_temp("contract/luban/name", arg);
		luban_say("好吧，就改成" + arg + "这个名字吧！\n");
	}
	return 1;
}

// 改变房屋代号
// 分两种状态处理：商谈中或是申请中
private int do_changeid(string arg)
{
	object me;
	string player_id;
	string position;

	me = this_player();
	player_id = me->query("id");

	if (submit_form(player_id))
	{
		// 正在申请
		position = query_form(player_id, "position");
		if (! check_legal_id(arg, position)) return 1;
		luban_say("行啊，就改成" + arg + "这个房屋代号吧！\n");
		set_form(player_id, "id", arg);
		set_form(player_id, "status", "申请");
		save();
		return 1;
	} else
	if (me->query_temp("contract/luban/questing") != "quest_desc")
		return 0;

	// 正在商谈
	if (check_legal_id(arg, me->query_temp("contract/luban/position")))
	{
		me->set_temp("contract/luban/id", arg);
		luban_say("行啊，就改成" + arg + "这个房屋代号吧！\n");
	}
	return 1;
}

// 改变房屋类型
// 分两种状态处理：商谈中或是申请中
private int do_changetype(string arg)
{
	object me;
	int value;
	string player_id;
//	string position;
	mapping example;

	me = this_player();
	player_id = me->query("id");

        if (! arg)
        {
                user_say("慢着... 我看看是不是换个房型更好...\n\n");
                check_type(me, arg);
                return 1;
        }

	if (submit_form(player_id))
	{
		// 正在申请
                user_say("我得改改房型，就换成" HIC + arg + NOR "吧。\n\n");
		if (! (example = check_legal_type(arg)))
		{
			write("找不到这种类型的房屋，所以没有改变房屋的类型。\n");
			return 1;
		}
		set_form(player_id, "room", example["name"]);
		value = example["value"];
		if (wizardp(me)) value = 0;
		set_form(player_id, "value", value);
		set_form(player_id, "descs", ([ ]));
		set_form(player_id, "status", "申请");
		save();
		luban_say("换一种房型也行，不过请你填写新的描述(changedesc)。\n");
		return 1;
	} else
	if (me->query_temp("contract/luban/questing") != "quest_desc")
		return 0;

	// 正在商谈
        user_say("慢着... 我得改改房型，就换成" HIC + arg + NOR "吧。\n\n");

	if (! check_type(me, arg))
		write("你没有改变房屋类型。\n");
	return 1;
}

// 改变房屋名字
// 分两种状态处理：商谈中或是申请中
private int do_changedesc(string arg)
{
	object me;
	string player_id;
//	mapping example;
	string room_name;
	string room_desc;

	me = this_player();
	player_id = me->query("id");

	if (submit_form(player_id))
	{
		// 正在申请
		if (! arg)
			return notify_fail("请按照正确格式输入：changedesc"
                                           " room_name description\n");

		if (sscanf(arg, "%s %s", room_name, room_desc) != 2)
		{
			room_name = arg;
			room_desc = 0;
		}

		// 修改描述信息
		modify_desc_in_form(player_id, room_name, room_desc);
		set_form(player_id, "status", "申请");
		save();
		return 1;
	} else
	if (me->query_temp("contract/luban/questing") != "quest_desc")
		return 0;

	// 正在商谈
	do_desc(arg);
	return 1;
}

// 结束输入
private int do_finish()
{
	object me;
	int value;
	string msg;

	me = this_player();
	if (me->query_temp("contract/luban/questing") != "quest_desc")
		return 0;

	show_desc(me, 0);

        value = me->query_temp("contract/luban/value");
        user_say("好了，我弄完了，你们这就开始么？\n\n");
        if (value)
        {
	        msg = "金临拨拉拨拉算盘，慢条斯理的对$N说道：要造这样"
                      "的房子，少说也得" + MONEY_D->price_str(value) +
                      "，不二价！\n";
	        if (wizardp(me))
	        {
		        msg += "鲁班对金临喝道：不得无理！此乃上届仙人"
                               "... 嘿嘿，到时意思意思就算了吧。\n";
	        }
        } else
        {
                msg = "金临拉拨拉算盘，对$N说道：便宜你了，造这个房子"
                      "免费，不要钱！\n";
        }

	msg += "鲁班略一沉吟，然后说道：你看看有没有什么问题么？若是没"
               "有，请先交五两黄金的手续费。\n\n";
	message_vision(msg, me);

	return 1;
}

// 撤消表单
private int do_withdraw()
{
	object me;

	me = this_player();
	if ( me->query_temp("contract/luban"))
	{
		do_stop();
		return 1;
	}
	if (! query("form/" + me->query("id")))
	{
		message_vision("鲁班一脸茫然......对$N说道：现在你好像"
                               "没有提交的申请吧！\n", me);
		return 1;
	}

	if (me->query_temp("decide_withdraw"))
	{
		message_vision("鲁班对$N说道：你若是要撤消申请，就请下"
                               "决定(decide)！\n", me);
		return 1;
	}

	switch (query("form/" + me->query("id") + "/status")) {
	case "申请":
	        luban_say("可惜，你怎么这就反悔了？\n");
	        break;

	case "同意":
	        luban_say("哎呀！真是可惜，巫师都同意了，你怎么打退堂"
                          "鼓了？\n");
	        break;

	case "拒绝":
	        luban_say("唉！没能被批准也别就打退堂鼓么，看看怎么回"
                          "事再说么。\n");
	        break;
	}
	message_vision("鲁班叹了口气，对$N说道：既然如此，此事也不必勉"
                       "强，如果你想好了，就下决定(decide)吧！\n", me);
	me->set_temp("decide_withdraw", 1);
	return 1;
}

// 删除表单
private int decide_withdraw()
{
	object me;

	me = this_player();
	if (! me->query_temp("decide_withdraw"))
                return 0;
	
	me->delete_temp("decide_withdraw");
	delete("form/" + me->query("id"));
	save();
	message_vision("鲁班摇摇头，掏出一个账本，翻了翻，不知道划掉了"
                       "什么东西。\n", me);
	return 1;
}

// 拆毁房屋
// 必须先询问鲁班有关拆房的信息
private int do_demolish()
{
	object me;

	me = this_player();
	if (! me->query_temp("demolish_room"))
		return notify_fail("你要拆什么？拆屋可要先和鲁班说一声。\n");

	me->delete_temp("demolish_room");
        demolish_room(me);
        return 1;
}

// 拆毁房屋的执行函数，该函数可能会被外部调用，所以必须察看权限
int demolish_room(object me)
{
//	string *names;
        string room_name;
        string key_id;
        mixed *file;

	object ob;
        object *obs;

	int i;

        if (! is_root(previous_object()))
        {
                write ("你没有权利拆毁房屋。\n");
                return 0;
        }
            
	if (! mapp(me->query("private_room")))
	{
		write("数据错误，无法继续执行！\n");
		return 0;
	}

        // 先清除所有的钥匙，以免留在当前玩家手中出问题。
        room_name = me->query("private_room/name") + "(" +
                    me->query("private_room/id") + ")";
        command("chat 手里有" + me->query("name") + "的" +
                room_name + "钥匙的，请你把钥匙交回到我这里来。");

        key_id = "1 of " + me->query("id");
        obs = users();
        for (i = 0; i < sizeof(obs); i++)
        {
                int flag;
                int k;
                object *carries;

                if ((i + 1) % 100 == 0)
                        // 防止执行时间过长而发生错误
                        reset_eval_cost();

                // 去掉玩家身上所有被毁掉的住房的钥匙
                carries = all_inventory(obs[i]);
                for (k = 0, flag = 0; k < sizeof(carries); k++)
                {
                        if (! carries[k]->id(key_id))
                                continue;

                        destruct(carries[k]);
                        if (flag) continue;

                        tell_object(obs[i], "\n你觉得身上好像少了点什么"
                                            "东西，仔细一看原来是" +
                                            me->query("name") +
                                            "家的钥匙不见了。\n\n");
                        flag = 1;
                }
        }

        // 防止执行时间过长而发生错误
        reset_eval_cost();

	// 删除用户创建的所有文件
	// 同时删除钥匙文件，钥匙有可能留在某些玩家手里，所以登录的
        // 时候可能会产生一些问题。
        file = get_dir(file_dir(me), -1);
        seteuid(getuid());
        if (file)
        {
                // 先清除所有的对象(object)
                for (i = 0; i < sizeof(file); i++)
                {
                        object room;

                        if (strsrch(file[i][0], ".c") == -1)
                                continue;

                        room = find_object(file_dir(me) + file[i][0]);
                        if (room)
                        {
                                message("vision", "突然几个童子飞也似"
                                        "的冲了过来，手里操着各种家伙"
                                        "，嚷嚷道：闪开！都闪开！\n",
                                        room);
                                catch(DBASE_D->clear_object(room));
                        } else
                        {
                                // clear the data in dbase
                                catch(DBASE_D->clear_object(file_dir(me) + file[i][0][0..<3]));
                        }
                }

                // 然后清除文件，因为清除对象的时候有可能因为保存
                // 进度而生成文件
                file = get_dir(file_dir(me), -1);
                for (i = 0; i < sizeof(file); i++)
                        rm(file_dir(me) + file[i][0]);
        }
        rmdir(file_dir(me));

	ob = get_object(me->query("private_room/position"));
	if (! objectp(ob))
	{
		write("有关房屋的信息已经被删除。但是建房的地点已经找"
                      "不到了！你和巫师联系吧。\n");
		me->delete("private_room");
                me->save();
		return 0;
	}

	ob->destroy_room(me->query("private_room/id"));
	ob->save();
	me->delete("private_room");
        me->save();
        if (environment(me) == environment(this_object()))
        {
                // 玩家在现场
	        message_vision("鲁班点点头，对$N说：好了，剩下的事情"
                               "我会办妥的！你可以走了。\n", me);
        }

	return 1;
}

// 显示用户输入的描述信息
// 如果用户正在商谈，就显示用户刚输入的描述信息，如果用户在等待审批，则显示用户
// 以前输入的描述信息
// 获得一个player对房屋的描述
// room_name是用户指定的房屋中的某一间的short描述
private void show_desc(mixed player, string room_name)
{
	mapping filesp;		// 原型房屋描述的文件mapping
	mapping descsp;		// 玩家的描述mapping

	int i;
	int value;		// 房屋造价
	int count;		// 显示的描述信息的数目
	object me;		// 调用该函数的对象
	object ob;		// 被描述的房屋的object或是建房场景的object

        string player_id;       // 建造房屋的玩家ID
	string desc;		// 房屋描述的mapping
	string *names;		// 房屋mapping的关键字的字符串表
	string room_nameid;	// 房屋名字及ID
	string room_type;	// 房屋类型
	string position;	// 建房的位置

	string ids;		// 查询时使用

	string info;		// 最后给出的提示信息
	string msg;		// 临时变量，用于显示信息

	me = this_player();
	info = "";

        if (objectp(player))
                player_id = player->query("id");
        else
        if (stringp(player))
                player_id = player;
        else
                return;

	if (mapp(query("form/" + player_id)))
	{
		// 在表单中有该玩家提交的表单
		ids = "form/" + player_id + "/";
		room_type = query(ids + "type");
		for (i = 0; i < sizeof(room_example); i++)
		{
			if (room_example[i]["type"] == room_type)
			{
				filesp = room_example[i]["files"];
				break;
			}
		}
		if (! mapp(filesp))
		{
			write("你申请的房屋类型(" + room_type + ")已经"
                              "不存在了，请和巫师联系。\n");
			return;
		}
		descsp = query(ids + "descs");
		room_type = query(ids + "room") + "(" + room_type + ")";
		room_nameid = query(ids + "name") + "(" + query(ids + "id") + ")";
		value = query(ids + "value");
		position = query(ids + "position");
		// 提示信息中给出该房屋的申请结果
		msg = query(ids + "wizard");
		switch (query(ids + "status")) {
		case "申请" :
			info = "巫师还没有查阅这份申请。";
			break;

		case "拒绝" :
			info = msg + "已经拒绝了这份申请！";
			if (query(ids + "memo") != "无")
				info += "\n原因是：" + query(ids + "memo");
			break;

		case "同意" :
			info = msg + "已经同意了这份申请！";
			break;
		}

		if (this_player()->query("id") == player_id)
		{
			if (query(ids + "status") == "同意")
			{
				info += HIW "\n你现在可以建造房屋了。"
                                        "如果这时修改了房屋的信息，就"
                                        "要得到巫师的再次批准。" NOR;
			} else
			if (query(ids + "status") == "拒绝")
			{
				info += HIR "\n你现在最好修改房屋的信"
                                        "息以获得巫师的批准，否则请撤"
                                        "消申请。" NOR;
			}
			info += "\n你可以撤消(withdraw)你提交的申请。";
		}
	} else
	if (objectp(player = present(player_id, environment(this_object()))) &&
	    player->query_temp("contract/luban/questing") == "quest_desc")
	{
                // 找到了在鲁班面前正在商谈的玩家
		filesp = player->query_temp("contract/luban/room/files");
		descsp = player->query_temp("contract/luban/descs");
		room_type = player->query_temp("contract/luban/room/name");
		room_type += "(" + player->query_temp("contract/luban/room/type") + ")";
		room_nameid = player->query_temp("contract/luban/name") + "(" +
			      player->query_temp("contract/luban/id") + ")";
		value = player->query_temp("contract/luban/value");
		position = player->query_temp("contract/luban/position");
	} else
	{
		// 没有商谈
		luban_say("呵呵，这位好像还没有打算建房子吧。\n");
		return;
	}

	ob = get_object(position);
	if (! objectp(ob))
	{
		write("你申请的建造房屋的地方(" + position + ")已经不"
                      "存在了，请和巫师联系!\n");
		return;
	}

        user_say("来，让我我看看" + room_nameid + "究竟打算怎么建。\n\n");
	msg = "好，你看看吧：" + "这里选用的是" + room_type +
              "这种类型的房屋。\n它的名字是" + room_nameid +
              "，将建筑在" + ob->query("short");
	if (wizardp(me) && wiz_level(me) >= WIZLEVEL)
		msg += "(" + position + ")";
	msg += "。\n";
	luban_say(msg);

	names = keys(filesp);
	count = 0;
	for (i = 0; i < sizeof(filesp); i++)
	{
		// 查找该房屋的object
		ob = get_object(filesp[names[i]]);
		if (! objectp(ob))
		{
			write(HIR "找不到示例的房屋(" + names[i] + "::" + filesp[names[i]] + ")，请和巫师联系。\n" NOR);
			continue;
		}
		if (! room_name || room_name == "" ||
		    ob->query("short") == room_name || names[i] == room_name)
		{
			// 查找用户输入的描述信息
			desc = descsp[names[i]];
			write(YEL "───────────────────────────────────────\n" NOR);
			write(YEL + "关于" + ob->query("short") + "(" + names[i] + ")" + YEL + "的描述：\n" + NOR);
			if (! desc)
			{
				// 用户没有输入描述信息，显示缺省信息
				desc = CYN "现在还没有输入描述信息，使"
                                       "用缺省的描述信息。如下：\n";
                                desc += "    ";
                                if (stringp(ob->query("default_long")))
				        desc += sort_desc(player,
                                                          ob->query("default_long"));
                                else
                                        desc += sort_desc(player,
                                                          replace_string(ob->query("long"), "\n", ""));
                                desc += NOR;
			} else
                                desc = "    " + sort_desc(player, desc);
			write(desc);
			count++;
		}
	}

	if (! count)
	{
		write("但是这里没有" + room_name + "这个房间，请用show查看所有的房间！\n");
		return ;
	}

	write(YEL "───────────────────────────────────────\n" NOR);
	write("描述就是上面列出的这些内容。\n");

	if (! value)
		info += "\n建造这些房间不需要花费任何银两。";
	else
		info += "\n建造这些房间需要花费" HIY + MONEY_D->price_str(value) + NOR "。";

	write(info + "\n\n");

	return ;
}

private void promote_type(object me)
{
        int i;
        int len;
        string msg;

        msg = "你眼光略略一扫，看到的房屋类型有：" +
              room_example[0]["name"] + "(" +
              room_example[0]["type"] + ")";
        len = strlen(msg);
        for (i = 1; i < sizeof(room_example); i++)
        {
                string temp;

                temp = "、" + room_example[i]["name"] + "(" +
                              room_example[i]["type"] + ")";
                msg += temp;
                len += strlen(temp);
                if (len > 70)
                {
                        msg += "\n";
                        len = 0;
                }
        }
        if (len) msg += "。\n";
        tell_object(me, msg);
}

// 询问玩家必要的建房信息，然后记录，留给巫师审批
private int quest_user(object me)
{
	message_vision("鲁班对$N说道：好，来，咱们仔细谈谈！\n", me);
	// 询问房屋名称
	luban_say("先告诉我你想建的房子叫什么名字(answer name)。\n"
                  "你若是不想谈了(stop)，告诉我也无妨。\n");
	me->set_temp("contract/luban/questing", "quest_name");
	return 1;
}

// 询问描述信息
private int quest_info(object me)
{
	message_vision("鲁班对$N说道：好，看来你喜欢" +
                       me->query_temp("contract/luban/room/name") +
                       "这种样式的。\n", me);
	// 显示房屋样式信息
	
	luban_say(@INFORMATION
你可以为你的房间添加你喜欢的描述，格式是：desc 房间名称 描述。当
然你也可以使用原有的描述，如果你想看看你输入的情况，可以用show来察看。
若一切都输入好了以后键入finish或是ok就可以了。如果想修改输入的房屋名
字，代号，类型的信息可以向我询问<修改>的方法。

举个描述的例子：“desc 小院 这里是一间别致的小院。”这样就给小院添加
了一行描述。如果想取消小院的描述可以键入：“desc 小院”就可以了。

描述还可以使用颜色，可以多行，具体细节可以问我 <规则> 这里要需要注意
的是：系统自动会在描述字符串的尾端加一个 $NOR$ 和 \n。因此描述不要以
\n结束，以免空行太多，观之不雅。另外，系统会自动的规范你输入的描述信
息，因此你不需要在描述信息前面添加段落起始的空格，同时也不需要在一个
段落内部插入\n以实现换行，对于过长的段落系统会自动的添加换行符。

另外，在描述的字符串内部不要输入空格，跳格，这些输入都会被抹掉。
INFORMATION );

	me->set_temp("contract/luban/questing","quest_desc");

	// 清除描述信息
	me->delete_temp("contract/luban/descs");
	me->set_temp("contract/luban/descs", ([ ]));
	return 1;
}

// 判断用户输入的房屋名字
private int check_name(object me, string arg)
{
	if (! arg)
	{
		luban_say("你怎么不说话？要是不想谈了(stop)，明说就是！\n");
		return 0;
	}

	if (! check_legal_name(arg, me->query_temp("contract/luban/position")))
                return 0;

	// 记录商谈好的房屋名字
	me->set_temp("contract/luban/name", arg);

	luban_say("请确定你的房屋的代号(3到10个英文字母)，考虑好了就回"
                  "答我(answer id)。\n");
	me->set_temp("contract/luban/questing", "quest_id");
	return 1;
}

// 判断用户输入的房屋代号
private int check_id(object me, string arg)
{
	if (! arg)
	{
		luban_say("你怎么不说话？要是不想谈了(stop)，明说就是！\n");
		return 0;
	}

	if (! check_legal_id(arg, me->query_temp("contract/luban/position")))
                return 0;

	// 记录商谈好的房屋代号
	me->set_temp("contract/luban/id", arg);

	luban_say("你想要哪种样式的住房(answer type)? 若是不太清楚，你"
                  "可以到附近的小院一观。\n");
        promote_type(me);
	me->set_temp("contract/luban/questing","quest_type");	
	return 1;
}

// 判断用户输入的房屋类型
private int check_type(object me, string arg)
{
	mapping *example;
	int value;

	if (! arg)
	{
		luban_say("你想要哪种样式的住房(answer type)？若是不"
                          "太清楚，你可以到附近的小院一观。\n");
                promote_type(me);
		return 0;
	}

	if (! (example = check_legal_type(arg)))
	{
		luban_say("你要的样式真稀奇，我这现在还没有。看清楚了"
                          "再告诉我。\n");
		return 0;
	}
	// 记录用户选定的房屋类型
	me->set_temp("contract/luban/room", example);

	// 计算房屋的价值
	value = me->query_temp("contract/luban/room/value");
	if (wizardp(me)) value = 0;
	me->set_temp("contract/luban/value", value);

	quest_info(me);
	return 1;
}

// 判断用户输入的房屋名是否合法
// 同时判断该处是否已经有住房
private int check_legal_name(string name, string position)
{
	object ob;

	if ((strlen(name) < 4) || (strlen(name) > 12 )) {
		write("对不起，你房屋的名字必须是 2 到 6 个中文字。\n");
		return 0;
	}

	if (!is_chinese(name))
	{
		write("对不起，请您用「中文」为房屋取名字。\n");
		return 0;
	}

	ob = get_object(position);
	if (! objectp(ob)) return 1;

	if (ob->query_room_name(name))
	{
		luban_say("对不起，据我所知，那里已经有一个住房叫这个"
                          "名字了！请另外起一个名字。\n");
		return 0;
	}

	return 1;
}

// 判断用户输入的房屋代号是否合法
private int check_legal_id(string roomid, string position)
{
	object ob;
	int i;

	i = strlen(roomid);
	
	if( (strlen(roomid) < 3) || (strlen(roomid) > 10 ) ) {
		write("对不起，你房屋的代号必须是 3 到 10 个英文字母。\n");
		return 0;
	}
	while(i--)
	{
		if(((roomid[i] < 'A') || (roomid[i] > 'Z')) &&
		   ((roomid[i] < 'a') || (roomid[i] > 'z')))
		{
			write("对不起，你房屋的代号必须用英文字母。\n");
			return 0;
		}
	}

        if (member_array(roomid, ban_room_id) != -1)
        {
                command("shake");
                luban_say("不要起这种名字！免得人家误会。\n");
                return 0;
        }

	ob = get_object(position);
	if (! objectp(ob)) return 1;

	if (ob->query_room_id(roomid))
	{
		luban_say("对不起，据我所知，那里已经有一个住房使用了"
                          "这个英文代号了，请另选一个。\n");
		return 0;
	}

	return 1;
}

// 判断用户输入的房屋类型是否存在
// 如果存在则返回那个房屋类型对应的mapping的指针
private mixed check_legal_type(string type)
{
	int i;
	for (i = 0; i < sizeof(room_example); i++)
	{
		if (room_example[i]["type"] == type ||
		    room_example[i]["name"] == type )
		return room_example[i];
	}
	return;
}

// 获得一个房屋对象
private object get_object(string file_name)
{
	object ob;

	if (! file_name || file_name == "")
		return 0;

	if (! (ob = find_object(file_name)))
		ob = load_object(file_name);

	return ob;
}

// 记录用户描述某一间房间的信息
private int record_desc(object me, string room_name, string desc)
{
	mapping filesp;
	mapping descsp;

	int i;
	object ob;
	string *names;

	if (! (desc = obey_description(desc))) return 0;

	filesp = me->query_temp("contract/luban/room/files");
	descsp = me->query_temp("contract/luban/descs");

	names = keys(filesp);
	for (i = 0; i < sizeof(names); i++)
	{
		// 查找该房屋的object
		ob = get_object(filesp[names[i]]);
		if (ob->query("short") == room_name || names[i] == room_name)
		{
			// 查找用户输入的描述信息
			if (! desc || desc =="")
			{
                                string msg;
				msg = "你没有输入描述" + ob->query("short") + "(" +
                                      room_name + ")的信息，将使用系统缺省的描述信息。\n";
                                msg += CYN "缺省的描述信息如下：\n";
                                if (stringp(ob->query("default_long")))
                                      msg += sort_desc(me, ob->query("default_long"));
                                else
                                      msg += sort_desc(me, replace_string(ob->query("long"), "\n", ""));
                                msg += NOR;
                                write(msg);
				map_delete(descsp, names[i]);
			} else
			{
				descsp[names[i]] = desc;
				write("你描述了" + ob->query("short") +
                                      "(" + room_name + ")。\n");
			}
			return 1;
		}
	}
	write("没有找到" + room_name + "，请查证再输入描述信息。\n");
	return 0;
}

// 保存用户输入的建房信息
private void record_contract(object me)
{
	string id;
	mapping descp;

	id = me->query("id");
	if (! mapp(query("form"))) delete("form");

	set_form(id, "player", me->query("name"));
	set_form(id, "name", me->query_temp("contract/luban/name"));
	set_form(id, "id", me->query_temp("contract/luban/id"));
	set_form(id, "room", me->query_temp("contract/luban/room/name"));
	set_form(id, "type", me->query_temp("contract/luban/room/type"));
	set_form(id, "position", me->query_temp("contract/luban/position"));
	set_form(id, "value", me->query_temp("contract/luban/value"));
	set_form(id, "time", time());
	//set_form(id, "status", "申请");
	set_form(id, "status", "同意"); //房屋申请更改为自动同意批准。
	set_form(id, "wizard", "无");
	set_form(id, "memo", "无");

	descp = me->query_temp("contract/luban/descs");

	set_form(id, "descs", descp);
	save();
}

// 改变玩家描述某一间房间的信息
// 修改的数据是存放在form中的
private int modify_desc_in_form(string player_id, string room_name, string desc)
{
	mapping example;
	mapping filesp;
	mapping descsp;

	int i;
	object ob;
	string *names;

	if (! (desc = obey_description(desc))) return 0;

	if (! (example = check_legal_type(query_form(player_id, "type"))))
	{
		write("这种房屋的类型已经不存在了，所以没有改变房屋的描述，请和巫师联系。\n");
		return 1;
	}

	filesp = example["files"];
	descsp = query_form(player_id, "descs");
	names = keys(filesp);

	for (i = 0; i < sizeof(names); i++)
	{
		// 查找该房屋的object
		ob = get_object(filesp[names[i]]);
		if (ob->query("short") == room_name || names[i] == room_name)
		{
			// 查找用户输入的描述信息
			if (! desc || desc =="")
			{
				write("你没有输入描述" + room_name +
                                      "的信息，将使用系统缺省的描述信息。\n");
				write("缺省的描述信息如下：\n" +
                                      stringp(ob->query("default_long")) ?
                                      sort_desc(player_id, ob->query("default_long")) :
                                      sort_desc(player_id, replace_string(ob->query("long"), "\n", "")));
				map_delete(descsp, names[i]);
			} else
			{
				descsp[names[i]] = desc;
				write("你重新描述了" + ob->query("short") + "。\n");
			}
			return 1;
		}		
	}
	write("没有找到" + room_name + "，所以没有修改描述信息。请查证再修改描述信息。\n");
	return 0;
}

// 讲一个描述的字符串正规化
private string obey_description(string desc)
{
	if (strlen(desc) > 420)
	{
		luban_say("你的描述也太长了吧...\n");
		return 0;
	}

	if (! desc || desc == "") return "";

	desc = replace_string(desc, "\"", "'");
	desc = replace_string(desc, "\\n", "\n");
	desc = replace_string(desc, "\t", "");
	desc = replace_string(desc, " ", "");

	desc = replace_string(desc, "$BLK$", BLK);
	desc = replace_string(desc, "$RED$", RED);
	desc = replace_string(desc, "$GRN$", GRN);
	desc = replace_string(desc, "$YEL$", YEL);
	desc = replace_string(desc, "$BLU$", BLU);
	desc = replace_string(desc, "$MAG$", MAG);
	desc = replace_string(desc, "$CYN$", CYN);
	desc = replace_string(desc, "$WHT$", WHT);
	desc = replace_string(desc, "$HIR$", HIR);
	desc = replace_string(desc, "$HIG$", HIG);
	desc = replace_string(desc, "$HIY$", HIY);
	desc = replace_string(desc, "$HIB$", HIB);
	desc = replace_string(desc, "$HIM$", HIM);
	desc = replace_string(desc, "$HIC$", HIC);
	desc = replace_string(desc, "$HIW$", HIW);
	desc = replace_string(desc, "$NOR$", NOR);

	desc = desc + NOR;

	return desc;
}

// 操作表单的命令帮助
private int do_help(string arg)
{
        if (! arg)
                return notify_fail("你要查询什么帮助信息？\n");

        switch (arg)
        {
        case "list":
                write(@WRITE
列出所有或者是部分玩家提交的表单。如果参数是all 或者没有，就
将所有的表单列出；如果参数是apply， 就列出所有申请中的表单；
如果参数是agree， 就列出所有已经批准的表单；如果参数是reject
则列出所有已经被巫师拒绝的表单；参数old 将把所有长期没有执行
的表单列出来。

命令规则：list all | apply | agree | reject | old
WRITE );
                return 1;

        case "type":
                write(@WRITE
显示某个玩家提交表单中的具体描述信息，如果指明了房屋名称，就
只显示该玩家对于该房屋的描述。

命令规则：type 玩家ID [房屋名称]
WRITE );
                return 1;

        case "agree":
                write(@WRITE
批准某个玩家提交的表单，批准以后玩家只需要缴纳现金即可建房。

命令规则：agree 玩家ID
WRITE );
                return 1;

        case "reject":
                write(@WRITE
拒绝某个玩家提交的表单，可以在拒绝的时候说明原因，原因将纪录
在表单中的备注中。

命令规则：reject 玩家ID [原因]
WRITE );
                return 1;

        case "delete":
                write(@WRITE
删除某个玩家提交的表单，表单在申请的状态不能被删除，必须拒绝
或同意以后才可以删除。这是为了避免玩家长期没有处理自己提交的
表单而设置的命令。

命令规则：delete 玩家ID
WRITE );
                return 1;
        }
}

// 列出表单
// 巫师使用
private int do_list(string arg)
{
	if (! exist_form()) return 1;

	if (! arg || arg == "all" || arg == "全部" || arg == "所有")
	{
		show_all();
		return 1;
	}

	switch (arg) {
	case "apply":
	case "申请":
	case "new":
		show_apply();
		return 1;

	case "agree":
	case "同意":
	case "批准":
		show_agree();
		return 1;

	case "reject":
	case "否决":
	case "不批准":
	case "没批准":
		show_reject();
		return 1;

	case "old":
	case "旧":
		show_old();
		return 1;
	}

	write("list的使用说明：\nlist all   : 显示所有的表单。\nlist apply : 显示申请的表单。\n" +
              "list agree : 显示巫师已经批准的表单。\nlist reject : 显示巫师已经否决的表单。\n" +
	      "list old   : 显示过期很久的表单。\n\n");
	return 1;
}

// 显示表单的详细信息
// 格式：type player_id room_name 显示该player描述的某间房屋
//   或：type player_id           显示该player的所有描述
// 此时如果由其他玩家正在输入，也可以察看
private int do_type(string arg)
{
	string player_id;
	string room_name;
//	int a;

	if (! wizardp(this_player()) || wiz_level(this_player()) < WIZLEVEL)
	{
		write("你无权察看表单中的描述信息！\n");
		return 1;
	}
	if (! arg)
        {
		write("usage: type player_id [room_name]\n");
                return 1;
        }

	if (sscanf(arg, "%s %s", player_id, room_name) != 2)
	{
		player_id = arg;
		room_name = "";
	}

	show_desc(player_id, room_name);
	return 1;
}

// 显示一个申请的简要说明
private void show_brief(string player_id)
{
	mapping form;
	string msg;
	string wizard;
	string memo;
//	int i;

	form = query("form/" + player_id);
	if (! form || ! mapp(form)) return;

	// 申请者的代号 申请者姓名  申请时间    房  型  状态  处 理 者  备   注
        // 12           .10        . 10        . 6      .4    .8         .16
	msg = sprintf("%-12s  %-10s  %-10s  %-6s",
                      player_id, form["player"],
                      ctime(form["time"])[0..9], form["room"]);

	// 现实表单的状态
	switch (form["status"]) {
	case "申请" :
		msg += HIW;
		break;

	case "同意" :
		msg += HIY;
		break;

	case "拒绝" :
		msg += HIR;
		break;
	}
	msg += "  " + form["status"] + NOR + "  ";

	wizard = form["wizard"];
	memo = form["memo"];

	if (! stringp(wizard) || wizard == "无" || wizard == "")
		wizard = "--------";

	if (! stringp(memo) || memo == "无" || memo == "")
		memo = "------";

	msg += sprintf("%-8s  %s\n", wizard, memo);
	write(msg);
	return;
}

// 判断表单是否存在，调用者是否有资格处理该表单
private int exist_form()
{
	if (! mapp(query("form")) || sizeof(query("form")) < 1)
	{
		write("现在鲁班这里并没有任何表单需要处理。\n");
		return 0;
	}
	if (! wizardp(this_player()) || wiz_level(this_player()) < WIZLEVEL)
	{
		write("你无权处理表单。\n");
		return 0;
	}
	return 1;
}

// 批准表单
// 巫师使用
private int do_agree(string arg)
{
        object ob;
	if (! exist_form()) return 1;

	if (! arg || ! query("form/" + arg))
        {
		write("usage: agree playerid\n");
                return 1;
        }
	
	if (query("form/" + arg + "/status") == "同意")
	{
		write("此表单已经被批准了。\n");
		return 1;
	}
	set("form/" + arg + "/status", "同意");
	set("form/" + arg + "/wizard", this_player()->query("name"));
	set("form/" + arg + "/memo", "无");
	write("你批准了" + query("form/" + arg + "/player") + "(" + arg + ")的申请。\n");
	save();

        if (objectp(ob = find_player(arg)) && ob != this_player())
                tell_object(ob, HIG + name() + "告诉你：你的表单已经被" +
                            this_player()->name() + "批准了，快来交钱吧。\n" + NOR);

	return 1;
}

// 拒绝表单
// 巫师使用
private int do_reject(string arg)
{
        object ob;
	string player;
	string memo;

	if (! exist_form()) return 1;

	if (! arg)
        {
	        write("usage: reject player_id [because]\n");
                return 1;
        }

	if (sscanf(arg, "%s %s", player, memo) != 2)
	{
		player = arg;
		memo = "无";
	}

	if (! query("form/" + player))
		return notify_fail("你要操作谁的表单？\n");

	if (memo == "无")
	{
		write("你可以添加备注信息(reject player 备注信息)，说明拒绝的理由。\n");
	}

	set("form/" + player + "/status", "拒绝");
	set("form/" + player + "/wizard", this_player()->query("name"));
	set("form/" + player + "/memo", memo);

	write("你已经拒绝了" + query("form/" + player + "/player") + "(" + player + ")的申请。\n");
	save();

        if (objectp(ob = find_player(arg)) && ob != this_player())
                tell_object(ob, HIG + name() + "告诉你：你的表单已经被" +
                            this_player()->name() + HIR "拒绝" NOR HIG
                            "了，快来看看吧。\n" + NOR);
	return 1;
}

// 删除表单
// 巫师使用
private int do_delete(string arg)
{
	if (! exist_form()) return 1;

	if (! arg)
        {
		write("usage: delete player_id\n");
                return 1;
        }

	if (query("form/" + arg + "/status") == "申请")
	{
		return notify_fail("你不能删除一个申请后还没有处理的表单。\n");
	}

	write((string)query("form/" + arg + "/player") + "(" + arg +
              ")提交的表单被删除了。\n");
	delete("form/" + arg);
	save();

	return 1;
}

// 显示刚刚申请的表单
private void show_apply()
{
	show_brief_list("申请", HIW + "以下是玩家提交的申请的表单" + NOR);
}

// 显示被批准的表单
private void show_agree()
{
	show_brief_list("同意", HIY + "以下是巫师已经批准申请的表单" + NOR);
}

// 显示被拒绝的表单
private void show_reject()
{
	show_brief_list("拒绝", HIR + "以下是被巫师拒绝申请的表单" + NOR);
}

// 显示被拒绝的表单
private void show_all()
{
	show_brief_list(0, HIG + "以下是所有的表单" + NOR);
}

// 显示比较陈旧的表单 - 过了15天的表单
private void show_old()
{
	int i;
	int count;

	string *ids;

	if (! exist_form()) return;

	count = 0;
	ids = keys(query("form"));
	for (i = 0; i < sizeof(ids); i++)
	{
		if (query("form/" + ids[i] + "/time") - time() > 86400 * 15)
		{
			// 超过15天的表单
			if (! count)
			{
				write(HIC "以下是玩家提交了很久的表单：\n" + NOR);
				write(YEL "────────────────────────────────────────\n" NOR);
				show_brief_title();
			}
			count++;
			show_brief(ids[i]);
		}
	}
	if (count)
	{
	        write(YEL "────────────────────────────────────────\n" NOR);
		write("共有" + ((string) count) + "张比较陈旧的表单。\n");
	} else
                write("目前没有陈旧的表单。\n");
}

// 显示列表
// info是显示的表单的类型 - info为空表示显示所有表单
// msg是显示的列表的名称 - 如“这是巫师批准的表单”
private void show_brief_list(string info, string msg)
{
	int i;
	int count;

	string *ids;

	if (! exist_form()) return;

	count = 0;
	ids = keys(query("form"));
	for (i = 0; i < sizeof(ids); i++)
	{
		if (! info || query("form/" + ids[i] + "/status") == info)
		{
			if (! count)
			{
				write(msg + "\n");
				write(YEL "────────────────────────────────────────\n" NOR);
				show_brief_title();
			}
			count++;
			show_brief(ids[i]);
		}
	}
	if (count)
	{
	        write(YEL "────────────────────────────────────────\n" NOR);
		write("共有" + ((string) count) + "张表单。\n");
	} else
                write("目前没有任何符合要求的表单。\n");
}

// 显示列表题头
private void show_brief_title()
{
	write(WHT "申请者的代号  申请者姓名  申请的时间  房  型  状态  处理巫师  备   注\n" NOR);
}

// 根据一个表单建造房屋
private void create_room(object me)
{
	mapping filesp;		// 建造的原型房的文件mapping
	mapping descsp;		// 玩家填写的描述mapping

	string player_id;	// 建找房间的玩家的ID
	string room_type;	// 房屋类型
	string room_name;	// 房屋名字
	string room_id;		// 房屋ID
	string room_key;	// 房屋的钥匙
        string room_owner;      // 房屋的主人
	string position;	// 建造房屋的地点(路径名)
	string position_short;	// 建造房屋的地点的中文名字
        string outdoors;        // 房屋所在的区域
	string entry;		// 房屋的入口

	string *content;	// 源文件的内容
	string *names;		// filesp的关键字集合
	string filename;	// 生成的文件名称
	string dstfile;		// 生成的文件内容

	string desc;		// 某间房屋的描述::钥匙的描述
	object ob;		// 房屋的object

	int i;
	int k;
	string ids;		// 快捷查询字符串

	me = this_player();
	if (! objectp(me)) return;

	player_id = me->query("id");
        room_name = me->query("name");
	entry = "";

	if (! mapp(query("form/" + player_id)))
	{
		// 没有找到玩家提交的表单
		return;
	}

	// 在表单中有该玩家提交的表单
	ids = "form/" + player_id + "/";
	room_type = query(ids + "type");
	for (i = 0; i < sizeof(room_example); i++)
	{
		if (room_example[i]["type"] == room_type)
		{
			filesp = room_example[i]["files"];
			break;
		}
	}

	if (! mapp(filesp))
	{
		write("你申请的房屋类型(" + room_type + ")已经不存在了"
                      "，请和巫师联系。\n");
		return;
	}

	descsp = query(ids + "descs");
	room_type = query(ids + "room");
	room_name = query(ids + "name");
	room_id = query(ids + "id");
        room_owner = query(ids + "player");
	position = query(ids + "position");
	names = keys(filesp);

	room_key = "1 of " + player_id;

	ob = get_object(position);
	if (! objectp(ob))
	{
		write ("你建房的地点已经不存在了，请和巫师联系！\n");
		return ;
	}
	position_short = ob->query("short");
        if (! (outdoors = ob->query("outdoors")))
                outdoors = "unknow";
	message("vision", HIY "鲁班拍拍手，说道：弟子们，生意来了！赚金子"
                              "银子的时候到了！！！\n" NOR +
		          YEL "霎时天昏地暗，你只觉得眼前模模糊糊，什么也"
                              "看不清楚，浑然不知道发生了什么事情。\n" NOR,
                          environment());

	// 读入并处理所有的文件
	for (i = 0; i < sizeof(names); i++)
	{
		// long_flag 是为了将原型房文件中出现在@LONG和LONG之间的字符串去掉而使用的标志。
		int long_flag;

		// enter_receive 是为了消除过多的空行使用的
		int enter_receive;

		if (file_size(filesp[names[i]]) <= 0)
		{
			write("缺少文件:" + filesp[names[i]] +
                              "，不能生成房屋，请和巫师联系。\n");
			// 删除已经产生的文件
			for (k = i - 1; k >= 0; k--)
				rm(to_player(player_id, filesp[names[k]]));
			return;
		}
		content = explode(read_file(filesp[names[i]]), "\n");
		long_flag = 0;
		enter_receive = 0;
		filename = to_player(player_id, filesp[names[i]]);
		dstfile = "// File(" + to_player(player_id, filesp[names[i]]) + ")" + 
			  " of " + player_id + "'s room\n// Create by LUBAN written by Doing Lu\n";
		for (k = 0; k < sizeof(content); k++)
		{
			if (strsrch(content[k], "LONG") != -1)	// 查到了一个LONG标志
			{
				long_flag = ! long_flag;
				if (! long_flag)
				{
					// 填充新的long描述
					desc = descsp[names[i]];
					if (! desc || desc == "")
					{
						// 采用了缺省描述
						ob = get_object(filesp[names[i]]);
						desc = ob->query("default_long");
                                                if (! desc) desc = replace_string(ob->query("long"), "\n", "");
					}
					desc = replace_string(desc, "ROOM_POSITION", position_short);
					desc = sort_desc(me, desc);
					dstfile += "\tset (\"long\", @LONG\n" + desc + "LONG );\n";
				}
				continue;
			}
			// 如果是LONG描述则忽略
			if (long_flag) continue;

			// 如果该句包含有/**/则忽略
			if (strsrch(content[k], "/**/") != -1) continue;
			if (strsrch(content[k], "/* EXAMPLE */") != -1) continue;
			if (strsrch(content[k], "/* example */") != -1) continue;

			// 去除语句中的//**
			content[k] = replace_string(content[k], "//**", "    ");

			// 如果该句以//开头，表示注释，则忽略
			if (content[k][0..1] == "//") continue;

			// 判断该文件是否是入口文件，即该文件是否有到建房处(position)的出口
			if (strsrch(content[k], "/d/room/xiaoyuan") != -1)
				entry = filename;

			// 替换语句中的ROOM/KEY, OWNER, position
			content[k] = replace_string(content[k], "ROOM_KEY", room_key);
			content[k] = replace_string(content[k], "ROOM_OWNER_ID", player_id);
			content[k] = replace_string(content[k], "ROOM_OWNER", room_owner);
			content[k] = replace_string(content[k], "ROOM_NAME", room_name);
			content[k] = replace_string(content[k], "ROOM_ID", room_id);
			content[k] = replace_string(content[k], "ROOM_POSITION", position_short);
			content[k] = replace_string(content[k], "OUTDOORS", outdoors);
			content[k] = replace_string(content[k], "/d/room/xiaoyuan", position);

			// 添加该语句
			if (content[k] == "")
				enter_receive ++;
			else 
				enter_receive = 0;
			if (enter_receive > 1) continue;
		
			dstfile += content[k] + "\n";
		}
		if (long_flag)
		{
			write("文件:" + filesp[names[i]] + "格式错误，"
                              "LONG不匹配，不能生成房屋，请和巫师联系。\n");
			// 删除已经产生的文件
			for (k = i - 1; k >= 0; k--)
				rm(to_player(player_id, filesp[names[k]]));
			return;
		}

		// 写入磁盘
		seteuid(getuid());
		rm(filename);
		assure_file(filename);
#if 0
                if (wiz_level(this_player()) >= WIZLEVEL)
                {
                        write(HIY "Try to write file:" + filename + "\n" NOR);
                        write(dstfile);
                        write(HIC "\nOk.\n" NOR);
                }
#endif
                // avoid the old object's data in dbase
                DBASE_D->clear_object(filename[0..<3]);
		write_file(filename, dstfile);
                VERSION_D->append_sn(filename);

		dstfile = "";
	}

	// 在建房处添加入口到玩家的房屋
	if (! entry || entry == "")
	{
		message("vision", "\n过了一会，鲁班和众弟子踉踉跄跄的"
                                  "赶了回来。鲁班苦着脸说：这是怪事，"
                                  "居然找不到入口！你去问问巫师究竟是"
                                  "怎么搞的！\n", environment());
		// 删除已经产生的文件
		for (k = i - 1; k >= 0; k--)
			rm(to_player(player_id, filesp[names[k]]));
		return;
	}

	ob = get_object(position);
	if (! ob || ! ob->create_room(room_name, room_id, entry))
	{
		message("vision", "\n过了一会，鲁班和众弟子踉踉跄跄的"
                                  "赶了回来。\n鲁班一脸霉样，苦着脸说"
                                  "：真邪门了，居然没有建成房子，\n奶"
                                  "奶的头，我公输班活了一千多年还是头"
                                  "次遇到这种事！\n",
                                  environment());
		// 删除已经产生的文件
		for (k = i - 1; k >= 0; k--)
			rm(to_player(player_id, filesp[names[k]]));
		return;
	}
	message("vision", "\n须臾，鲁班和众弟子已然归来。\n"
                          "鲁班喜道：呵呵，房屋建好了，一切"
                          "顺利，恭喜恭喜！\n", environment());
	ob->save();

	// 创建玩家房屋的钥匙文件
	filename = file_dir(player_id) + "key.c";
	dstfile = "// File(" + filename + ")" + 
		  " of " + player_id + "'s key\n// Create by LUBAN written by Doing Lu\n";
	dstfile += @KEY

#include <ansi.h>

inherit ITEM;

string query_autoload() { return "1"; }

void create()
{
	set_name(YEL "KEY_NAME" NOR, ({ "key", "KEY_ID" }));
	set_weight(10);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", @LONG
KEY_DESCRIPTION。
这是原配钥匙。
LONG );
		set("unit", "把");
		set("no_pawn", 1);
                set("no_sell", 1);
		set("item_make", 1);
		set("value", 1);
	}
}
KEY;
	// 替换钥匙名称，ID，描述
	desc = "一把用来开启" + room_name + "(" + room_id + ")的钥匙";
	dstfile = replace_string(dstfile, "KEY_DESCRIPTION", desc);
	dstfile = replace_string(dstfile, "KEY_NAME", me->query("name") + "家的钥匙");
	dstfile = replace_string(dstfile, "KEY_ID", room_key);

	seteuid(getuid());
	rm(filename);
	assure_file(filename);
	write_file(filename, dstfile);
        VERSION_D->append_sn(filename);

	// 生成钥匙
	ob = clone_object(filename);
	message_vision("鲁班拿出一把钥匙，对$N说：诺，这是钥匙，收好了！"
                       "若是丢了可以到我这里再配一把。\n", me);
	ob->move(this_object());
        command("give key to " + me->query("id"));

	// 删除鲁班处纪录的表单
	delete("form/" + player_id);
	save();

	// 设置玩家的数据库
	me->set("private_room/build", 1);		// 已经建过房屋
	me->set("private_room/position", position);	// 房屋所在的位置
	me->set("private_room/entry", entry);		// 房屋入口处的文件路径
	me->set("private_room/name", room_name);	// 房屋的名字
	me->set("private_room/id", room_id);		// 房屋的ID
	me->set("private_room/type", room_type);	// 房屋的类型
        me->set("private_room/key_no", 1);              // 使用原配钥匙
	me->save();

        command("chat* heihei");
	return;
}

// 获得玩家保存房屋文件的路径名
private string file_dir(mixed me)
{
        string dir;

        dir =  DATA_DIR + "room/";
        if (objectp(me))
                dir += me->query("id") + "/";
        else
        if (stringp(me))
                dir += me + "/";
        else
                return 0;

        return dir;
}

// 将原型房的文件名转化成为用户房屋的文件名
private string to_player(string player_id, string file_name)
{
	string typestr;
	string retstr;

	sscanf(file_name, "/d/room/%s/%s", typestr, retstr);
	return file_dir(player_id) + retstr;
}

// 这是为了加快运行速度使用的宏函数
// 判断首部的字符串是否相同(字符串1必须比字符串2长)
#define	IS_HEAD(s1,s2)	  (s1[i..i + strlen(s2) - 1] == s2)
// 判断字符串首部是否为英文标点符号
#define	IS_HEAD_ESIGH(s1) (s1[i] == '.' || s1[i] == '!' || s1[i] == ';' || s1[i] == ',' || s1[i] == ':')
// 判断字符串首部是否为中文标点符号
#define	IS_HEAD_CSIGH(s1) (s1[i..i + 1] == "。" || s1[i..i + 1] == "！" || s1[i..i + 1] == "；" || s1[i..i + 1] == "，" || s1[i..i + 1] == "：")
// 判断字符串首部是否是中文字符
#define	IS_HEAD_CHN(s1)	  (s1[i] > 160)

// 规范描述信息
// 这个函数主要为讲用户输入的描述信息添加回车和跳格
private string sort_desc(mixed me, string desc)
{
	string res;
        string space;           // 段落前面的空格
	int curlen;		// res的当前行长
	int perline = 60;	// 最大行长(如果有标点符号，可能会超出)
	int crlen;		// 换行符的长度
	int escflag;		// 转义序列的长度
        int colorflag;          // 本行是否有颜色
        int len;                // 字符串的长度
        int i;

        object pos;
        string player_id;
        string ids;
        string room_name;
        string room_owner;
        string position_short;

        space = "    ";
	res = "";              	// 第一个段落前的不加空格
	curlen = strlen(space);
        colorflag = 0;

	crlen = strlen("\n");

	if (! desc || desc =="")
		return 0;

        if (stringp(me)) player_id = me; else
        if (objectp(me)) player_id = me->query("id"); else
                         return 0;
        if (mapp(query("form/" + player_id)))
        {
                ids = "form/" + player_id + "/";
                room_name = query(ids + "name");
                room_owner = query(ids + "player");
                pos = get_object(query(ids + "position"));
                if (pos) position_short = pos->short(); else
                         position_short = "不知何处";
        } else
        if (objectp(me))
        {
                ids = "contract/luban/";
                room_name = me->query_temp(ids + "name");
                room_owner = me->query("name");
                pos = get_object(me->query_temp(ids + "position"));
                if (pos) position_short = pos->short(); else
                         position_short = "不知何处";
        } else
                return 0;

	// 替换语句中的ROOM_OWNER, position
	desc = replace_string(desc, "ROOM_NAME", room_name);
	desc = replace_string(desc, "ROOM_OWNER", room_owner);
	desc = replace_string(desc, "ROOM_POSITION", position_short);

        i = 0;
        len = strlen(desc);
        desc += " ";            // 防止比较过程中溢出
        while (len > i)
	{
		// 添加字符
		// 判断是否为汉字
		while (curlen < perline)
		{
			if (IS_HEAD_CHN(desc))
			{
				res += desc[i..i+1];
                                i += 2;
				curlen += 2;
			} else
			if (desc[i] >= 32)
			{
				res += desc[i..i];
                                i++;
				curlen ++;
			} else
			  break;
		}

		// 判断下一个字符是否为标点，标点不能出现在行首
		if (IS_HEAD_CSIGH(desc) && curlen < perline + 2)
		{
			res += desc[i..i+1];
                        i += 2;
			curlen += 2;
		}

		if (IS_HEAD_ESIGH(desc) && curlen < perline + 2)
		{
			res += desc[i..i];
                        i++;
			curlen ++;
		}

		// 判断是否为换行
		if (IS_HEAD(desc, "\n"))
		{
			if (curlen) res += "\n";	// 避免刚刚有换行
			res += space;
			curlen = strlen(space);
                        i += crlen;
                        colorflag = 0;
                        continue;
		}

		// 扫描desc，查找转义字符
		if (desc[i] == 27)
                {
                        escflag = 0;
                        colorflag = 1;
			while (i + escflag < len && desc[i + escflag] != 'm')
                                escflag++;
                }

		if (escflag > 0)
		{
			// 颜色不计长度
			res += desc[i..i + escflag];
                        i += escflag + 1;
		}

		// 如果计满一行，并且没有遇到换行符号或者是转义符号就
                // 就自动添加一个换行符
		if (curlen >= perline && ! IS_HEAD(desc, "\n") &&
                    desc[i] != 27)
		{
			res += "\n";
			curlen = 0;
                        colorflag = 0;
		}
	}

        if (curlen || colorflag) res += "\n";
	return res;
}