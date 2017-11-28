// pigroom.c 拱猪房
// Written by Xiang Tu <tu@uwalpha.uwinnipeg.ca>

#include <pig.h>
#include <ansi.h>

inherit ROOM;

string 	*seat = ({ "north", "west", "south", "east" });
mapping chinese_seat = ([ 
	"north": "北边",
	"west" : "西边",
	"south": "南边",
	"east" : "东边",
]);

int pig_stage;
int round_no, roundcard_count;
string *round_order = allocate(4);
int bid_flag;
string bidcard_str = "";
object server;
string claimer;
mapping	pl = allocate_mapping(4),
 	cards = allocate_mapping(4),
	card_count = allocate_mapping(4),
	roundcards = allocate_mapping(4),
	picks = allocate_mapping(4),
	pick_count = allocate_mapping(4),
	passed = allocate_mapping(4),
	agreed = allocate_mapping(4),
	hscore = allocate_mapping(4),
	tscore = allocate_mapping(4);
	
string	dealer;
int	*allow_playbid = allocate(4);
int 	*oldcards = allocate(52), 
	*newcards = allocate(52);

int pl_count();
void pig_init();
void deal_init();
void bid_init();
void after_bid();
void round_init(string w);
void after_round();
void play_init();
void after_claim();
void after_play();
void after_round();
void after_winner(string rw);
void after_hand();
void auto_play();

string refresh_str(string dir);
string picks_str();
string table_str(string dir);
string scoreboard_str();

void reset()	// set this room to no_reset
{}

int is_chat_room() { return 1; } // Always chat room

int pl_count()
{
	int i, r;
	for (i = r = 0; i < 4; i++)
		if (objectp(pl[seat[i]]))
			r++;
		else
			map_delete(pl, seat[i]);
	return r;
}
void pig_init()
{
	int i;
	pig_stage = PIG_INITTING;
	for (i = 0; i < 4; i++) {
		tscore[seat[i]] = hscore[seat[i]] = 0;
		cards[seat[i]] = allocate(13);
		picks[seat[i]] = allocate(16);
	}
	for (i = 0; i < 52; i++)
		oldcards[i] = i;
}
void deal_init()
{
	pig_stage = PIG_DEALING;
	tell_room(this_object(), scoreboard_str());
	tell_room(this_object(),"桌长请 deal ！\n");
}
void bid_init()
{
	int i;
	pig_stage = PIG_BIDDING;
	bidcard_str = "";
	bid_flag = 0;
	for (i = 0; i < 4; i++) {
		allow_playbid[i] = 1;
		passed[seat[i]] = 0;
	}
}

void play_init()
{
	int i, j;
	pig_stage = PIG_PLAYING;
	round_no = 1;
	for (i = 0; i < 4; i++) {
		pick_count[seat[i]] = 0;
		card_count[seat[i]] = 13;
		for (j = 0; j < 16; j++)
			picks[seat[i]][j] = 53;
		claimer = "";
		agreed[seat[i]] = 0;
	}
	round_init(dealer);
}
void round_init(string rw)
{
	int i;
	for (i = 0; i < 4; i++) 
		roundcards[seat[i]] = -1;
	roundcard_count = 0;
	round_order = PIG_D->order_turn(rw);
	if (pig_stage == PIG_PLAYING)
		tell_object(pl[rw], refresh_str(rw) + "现在轮到你出牌！\n");
}
	
void init()
{
	add_action("do_sit", "sit");
	add_action("do_leave", "leave");
	add_action("do_deal", "deal");
	add_action("do_bid", "bid");
	add_action("do_bid", "sell");
	add_action("do_pass", "pass");
	add_action("do_play", "play");
	add_action("do_refresh", "refresh");
	add_action("do_skip", "skip");
	add_action("do_claim", "claim");
}

string picks_str()
{
	int i;
        string r = "", t; 
        for (i = 0; i < 4; i++) {
		t = "";
		if (objectp(pl[seat[i]]))
                	t = pl[seat[i]]->query("name");
		else 
			t = chinese_seat[seat[i]];
                if (pick_count[seat[i]] > 0) {
                        t += "捡了下面这些牌：\n";
                        t += PIG_D->refresh(picks[seat[i]], 0, pick_count[seat[i]] - 1);
                }
                else
                       	t = "";
		r += t;
        }
	return r;
}

string refresh_str(string dir)
{
		return PIG_D->refresh(cards[dir], 0, card_count[dir] - 1);
}
	

string table_str(string dir)	// what's going on in table ?
{
	int i;
	mapping rseat = ([]);
	string r = "", z = "";

	if (pig_stage == PIG_PLAYING && pl_count() == 4) { // if in playing mode
		if (dir != "north" && dir != "west" && dir != "south" 
			&& dir != "east")
			rseat = PIG_D->order_turn("north");
		else
			rseat = PIG_D->order_turn(dir);
	
		if (roundcard_count < 4)
			r = sprintf("现在是第%s轮，该由%s出牌。\n", 
			chinese_number(round_no), 
			pl[round_order[roundcard_count]]->query("name"));
		if (bidcard_str != "")
			r += "卖了的牌：" + bidcard_str + "\n\n";
		else
			r += "没有人卖牌。\n";
		r = sprintf("%s%24s（%s）\n", r, "", pl[rseat[2]]->query("name"));	// writes north name
		r = sprintf("%s%26s%s\n", r, "", 
			PIG_D->card_str(roundcards[rseat[2]]));
		r = sprintf("%s%4s%16s%6s%6s%6s%s\n", r, "", "（" + 
			pl[rseat[3]]->query("name") + "）", 
			PIG_D->card_str(roundcards[rseat[3]]), "", 
			PIG_D->card_str(roundcards[rseat[1]]), "（" +
			pl[rseat[1]]->query("name") + "）");
		r = sprintf("%s%26s%s\n", r, "",
			PIG_D->card_str(roundcards[rseat[0]]));
		r = sprintf("%s%24s（%s）\n", r, "", pl[rseat[0]]->query("name"));
		if (card_count[dir] > 0)
			r += refresh_str(dir);
		r += picks_str();
	}
	else {
	        r = "这是一张专门用于拱猪的四方桌。\n\n";
               	if (bidcard_str != "")
                        r += "卖了的牌：" + bidcard_str + "\n\n";
                else
                        r += "没有人卖牌。\n";
		for (i = 0; i < 4; i++) 
			if (objectp(pl[seat[i]])) {
				if (pl[seat[i]] == server) z = "@"; else z = "";
				r = sprintf("%s%s的椅子上坐的是：%s(%s)%s。\n", r,
				chinese_seat[seat[i]], pl[seat[i]]->query("name"),
				pl[seat[i]]->query("id"), z);
			}
			else
				r = sprintf("%s%4s的椅子是空的。如果你想玩，可以用 sit %-5s 坐上去。\n",
				r, chinese_seat[seat[i]], seat[i]);
	}
	return r;
}

string scoreboard_str()
{
	int i;
	string r;
	r = "拱猪成绩表(Scoreboard)\n－－－－－－－－－－－－－－－－－\n姓名　　　　　　　　盘分　　　总分\n－－－－－－－－－－－－－－－－－\n";
	for (i = 0; i < 4; i++)
		if (objectp(pl[seat[i]]))
			r = sprintf("%s%-14s%10d%10d\n", r,
			(string)pl[seat[i]]->query("name"),
			(int)hscore[seat[i]], (int)tscore[seat[i]]);
	return r + "－－－－－－－－－－－－－－－－－\n";
}

void score_reset()
{
	int i;
	for (i = 0; i < 4; i++)
		tscore[seat[i]] = 0;
}

int do_skip(string arg)
{
	if (!this_player()->query_temp("pigging_seat"))
		return notify_fail("你没有在拱猪！\n");
	if (this_player() != server)
		return notify_fail("只有桌长才能跳过这副牌！\n");
	if (pig_stage < PIG_BIDDING)
		return notify_fail("牌都没有，跳什么？\n");
	message_vision("桌长$N决定跳过这副牌！！\n", server);
	if (pl_count() == 4)
		deal_init();
	return 1;
}

void after_claim()
{
	int i, j/*, k*/;
	for (i = 0; i < roundcard_count; i++) 
		if (PIG_D->is_special(roundcards[i]))
			picks[claimer][pick_count[claimer]++] = roundcards[j];
	for (i = 0; i < 4; i++)
		for (j = 0; j < card_count[seat[i]]; j++)
			if (PIG_D->is_special(cards[seat[i]][j]))
				picks[claimer][pick_count[claimer]++] = cards[seat[i]][j];
	after_hand();
}
int do_claim(string arg)
{
	int i;
	object me = this_player();
	if (!me->query_temp("pigging_seat"))
		return notify_fail("你没有在拱猪！\n");
	if (pl_count() != 4)
		return notify_fail("现在桌子上没坐满！\n");
	if (pig_stage != PIG_PLAYING)
		return notify_fail("你想干什么？\n");
	if (claimer == me->query_temp("pigging_seat"))
		return notify_fail("一次就够了！\n");
	if (!arg) {
		if (claimer != "")
			return notify_fail("claim yes|no ？\n");
		agreed[claimer = me->query_temp("pigging_seat")] = 1;
		write("你发出全收的要求！等待回音……\n");
		for (i = 0; i < 4; i++)
			if (seat[i] != claimer)
				tell_object(pl[seat[i]], me->query("name") + 
					"认为他手中的牌都是大的了！\n" +
					refresh_str(me->query_temp("pigging_seat")) +
					"请用 claim yes 通过，或者 claim no 否决。\n");
		return 1;
	}
	if (arg == "yes") {
		if (claimer == "")
			return notify_fail("没有人想全收！\n");
		if (!agreed[me->query_temp("pigging_seat")]) {
			agreed[me->query_temp("pigging_seat")] = 1;
			message_vision("$N同意$n的牌都是大的了！\n", me, pl[claimer]);
			for (i = 0; i < 4; i++)
				if (agreed[seat[i]] != 1)
					return 1;
			message_vision("$N的要求被通过了！！\n", pl[claimer]);
			after_claim();
			return 1;
		}
	}
	if (arg == "no") {
		if (claimer == "")
			return notify_fail("没有人想全收！\n");
		message_vision("$N否决了$n的要求！！\n继续出牌！\n", me, pl[claimer]);
		claimer = "";
		for (i = 0; i < 4; i++)
			agreed[seat[i]] = 0;
		return 1;
	}
	else
		return notify_fail("claim 什么？\n");
}
	

int do_sit(string arg)
{
	object me = this_player();
        object *obs;
        string *ips;

	if (!arg || (arg != "north" && arg != "west" && arg != "south" && arg != "east"))
		return notify_fail("你想坐在哪里？\n");

	if (server == me)
		return notify_fail("桌长不能换坐位！\n");

	map_delete(pl, (string)me->query_temp("pigging_seat"));
		
	if (!objectp(pl[arg])) {
                obs = filter_array(values(pl), (: objectp($1) && interactive($1) :));
                ips = map_array(obs, (: query_ip_number :));
                if (member_array(query_ip_number(me), ips) != -1)
                        return notify_fail("你不能和IP地址相同的玩家坐在一张桌子上玩牌。\n");

		if (!pl_count()) {
			pig_init();
			server = me;
			write("你现在是桌长！\n");
			round_order = PIG_D->order_turn(dealer = arg);
		}

		pl[arg] = me;
		me->set_temp("pigging_seat", arg);
		message_vision("$N坐上了" + chinese_seat[arg] + "的位子。\n", me);
		if (pl_count() == 3)
			tell_room(this_object(), "现在是三缺一，你们只再需要一个玩家就可以开拱了！\n");
		if (pl_count() == 4) {
			tell_room(this_object(), "好，人凑齐了！\n");
			deal_init();
		}
		return 1;
	}
	else
		return notify_fail("这个位子上已经有人了！\n");
}

int do_leave(string arg)
{
	int i;
	object me = this_player();

	if (!me->query_temp("pigging_seat", arg))
		return notify_fail("你现在没有在拱猪！\n");
	else if (server == me) {
		message_vision("桌长$N不想再拱下去了！\n", me);
		server = 0;
		for (i = 0; i < 4; i++) 
			if (objectp(pl[seat[i]])) {
				message_vision("$N站了起来。\n", pl[seat[i]]);
				pl[seat[i]]->delete_temp("pigging_seat");
				map_delete(pl, seat[i]);
			}
		pig_stage = PIG_INITTING;
		return 1;
	}
	else {
		map_delete(pl, (string)me->query_temp("pigging_seat"));
		me->delete_temp("pigging_seat");
		message_vision("$N不想再拱了，站了起来！\n", me);
		return 1;
	}
}

void do_assign_cards()	// assign cards to players
{
	int i, j, k = 0;

	for (i = 0; i < 13; i++)
		for (j = 0; j < 4; j++) 
			cards[seat[j]][i] = newcards[k++];
	for (i = 0; i < 4; i++) {
		cards[seat[i]] = sort_array(cards[seat[i]], 1);
		tell_object(pl[seat[i]], PIG_D->refresh(cards[seat[i]], 0, 12));
		card_count[seat[i]] = 13;
	}
}

int do_deal(string arg)
{
	int i, j, k;
	object me = this_player();
	if (me != server)
		return notify_fail("你不是桌长！\n");
	if (pig_stage != PIG_DEALING || pl_count() != 4)
		return notify_fail("现在不能发牌！\n");
	PIG_D->shuffle(oldcards, newcards, 2);

	for (i = 0; i < 13; i++)
		for (j = 0; j < 4; j++) 
			cards[seat[j]][i] = newcards[k++];
	for (i = 0; i < 4; i++) {
		cards[seat[i]] = sort_array(cards[seat[i]], 1);
		tell_object(pl[seat[i]], "你得到的牌为：\n" +
			PIG_D->refresh(cards[seat[i]], 0, 12));
		card_count[seat[i]] = 13;
        }
	tell_room(this_object(), "发完牌了，有谁要卖牌的没有？\n");
	tell_room(this_object(), "如果你卖完了牌，打一下 pass 。\n");
	bid_init();
	return 1;
}

int do_refresh(string arg)
{
	object me = this_player();
	if (!me->query_temp("pigging_seat"))
		return notify_fail("你没有在拱猪！\n");
	if (pig_stage < PIG_BIDDING || 
		card_count[me->query_temp("pigging_seat")] < 1)
		return notify_fail("你手上没有牌！\n");
	tell_object(pl[(string)me->query_temp("pigging_seat")], 
		"你手上有这些牌：\n" + refresh_str(me->query_temp("pigging_seat")));
	return 1;
}

int do_bid(string arg)
{
	object me = this_player();
	int c, b;
	string ts;

	if (!me->query_temp("pigging_seat"))
		return notify_fail("你没有在拱猪！\n");
	if (pig_stage != PIG_BIDDING)
		return notify_fail("现在不是卖牌的时候！\n");
	if (!arg)
		return notify_fail("你想卖什么？\n");
	if ((c = PIG_D->is_validcard(arg)) == -1 ||
		!PIG_D->has_card(cards[me->query_temp("pigging_seat")], 0, 12, c))
		return notify_fail("你手上没有这张牌！\n");
	if (!(b = PIG_D->is_validbid(c)))
		return notify_fail("这张牌不能被卖！\n");
	if (bid_flag & b)
		return notify_fail("这张牌已经被卖过了！\n");
	bid_flag |= b;
	switch (b) {
	case BID_SPIG :
		allow_playbid[0] = 0; break;
	case BID_HACE :
		allow_playbid[1] = 0; break;
	case BID_DSHEEP :
		allow_playbid[2] = 0; break;
	case BID_CTRANS :
		allow_playbid[3] = 0; break;
	}
	message_vision("$N说道：我卖" + PIG_D->card_str(c) + "！\n", me);
	ts = "";
	if (bidcard_str != "") ts = "，";
	bidcard_str = PIG_D->card_str(c) + "（" + me->query("name") + "）" +
		ts + bidcard_str;

	return 1;
}

int do_pass(string arg)
{
	object me = this_player();
	int i;

	if (!me->query_temp("pigging_seat"))
		return notify_fail("你没有在拱猪！\n");
	if (pig_stage != PIG_BIDDING)
		return notify_fail("你想干什么？\n");
	if (passed[me->query_temp("pigging_seat")] == 1)
		return notify_fail("你已经停卖了！\n");
	passed[me->query_temp("pigging_seat")] = 1;
	message_vision("$N说道：我停卖！\n", me);
	for (i = 0; i < 4; i++) 
		if ((int)passed[seat[i]] == 0)
			return 1;

	for (i = 0; i < 4; i++)
		passed[seat[i]] = 0;
	tell_room(this_object(), "全部停卖，开拱！！\n");
	tell_room(this_object(), "这把由" + pl[dealer]->query("name") + "先出。\n");

	play_init();
	return 1;
}

void after_play()
{
	int i;
	roundcard_count++;
	for (i = 0; i < 4; i++) 
		if (card_count[seat[i]] > 0 && objectp(pl[seat[i]]))
			tell_object(pl[seat[i]], table_str(seat[i])); 
	if (roundcard_count > 3)
		after_round();
}
	
void after_winner(string rw)
{
	int i;
//      int k;
	message_vision("$N的" + PIG_D->card_str(roundcards[rw]) + "最大！\n", pl[rw]);
	for (i = 0; i < 4; i++)
                if (PIG_D->is_special(roundcards[seat[i]])) {
                        picks[rw][pick_count[rw]++] = 
                                roundcards[seat[i]];
                        if (roundcards[seat[i]] == SPIG) {
				message_vision("$N得到了猪头！！\n", pl[rw]);
                                CHANNEL_D->do_channel(this_object(), "rumor",
                                        "号外号外！" + pl[rw]->name(1) + HIM "喜得猪头！");
                                dealer = rw;
			}
                }
        picks[rw] = sort_array(picks[rw], 1);
}

void after_round()
{
//	int i;
	string rw;

	allow_playbid[SUIT(roundcards[round_order[0]])] = 1;
	after_winner(rw = PIG_D->card_cmp4(roundcards, SUIT(roundcards[round_order[0]])));
	round_init(rw);
	
	if (round_no++ == 12) 
		auto_play();  // starts auto_play
}
void auto_play()
{
	int i;
	for (i = 0; i < 4; i++)
		roundcards[seat[i]] = cards[seat[i]][0];
	roundcard_count = 4;
        for (i = 0; i < 4; i++) {
		card_count[seat[i]] = 0;
		tell_object(pl[seat[i]], table_str(seat[i])); 
	}
	after_winner(PIG_D->card_cmp4(roundcards, SUIT(roundcards[round_order[0]])));
	after_hand();
}

void after_hand()
{
	// doing the scoring here
	int i;
        int pig;
	string collect_all = "";

	for (i = 0; i < 4; i++) {
		hscore[seat[i]] = PIG_D->count_score(picks[seat[i]], bid_flag);
		if (hscore[seat[i]] == 1000)
			collect_all = seat[i];
		pl[seat[i]]->add("pig_played", 1);
		pl[seat[i]]->add("pig_score", hscore[seat[i]]);
	}
	if (collect_all == "")
		for (i = 0; i < 4; i++) {
			tscore[seat[i]] += hscore[seat[i]];
			if (tscore[seat[i]] <= -1000) 
				pl[seat[i]]->add("pig_head", 1);
		}
	else {
		for (i = 0; i < 4; i++)
			if (seat[i] != collect_all) 
				pl[seat[i]]->add("pig_head", 1);
	}
        pig = 0;
	for (i = 0; i < 4; i++) 
		if (tscore[seat[i]] <= -1000)
                {
			message_vision("$N是一头猪！\n", pl[seat[i]]);
                        if (random(10) == 1)
                                CHANNEL_D->do_channel(this_object(), "rumor",
                                                     "特大喜讯！" + pl[seat[i]]->name(1) +
                                                     HIM "经过多方努力，终于成为猪的一员！");
                        pig++;
                }
        if (pig)
        {
        	for (i = 0; i < 4; i++)
        		if (tscore[seat[i]] > -1000 &&
                            pl[seat[i]]->can_improve_skill("feed-power"))
                                pl[seat[i]]->improve_skill("feed-power", 10000 * pig);
		score_reset();
        }
	deal_init();
}
	
int do_play(string arg)
{
	object me = this_player();
	int i, c, sc, nbc = 0, cpos = -1;
	string ms;

	if (!(ms = me->query_temp("pigging_seat")))
		return notify_fail("你没有在拱猪！\n");
	if (pig_stage != PIG_PLAYING)
		return notify_fail("现在不是出牌阶段！\n");
	if (ms != round_order[roundcard_count])
		return notify_fail("还没轮到你出牌！\n");
	if (!arg || (c = PIG_D->is_validcard(arg)) == -1)
		return notify_fail("你要出哪张牌？\n");
	for (i = 0; i < card_count[ms]; i++) 
		if (cards[ms][i] == c) {
			cpos = i; break;
		}
	if (cpos == -1)
		return notify_fail("你手里没有这张牌！\n");

	if (roundcard_count > 0 && (sc = PIG_D->has_suit(cards[ms], 0, 
		card_count[ms] - 1, SUIT(roundcards[round_order[0]]))) > 0 && 
		SUIT(c) != SUIT(roundcards[round_order[0]]))
		return notify_fail("你不能出这张牌！\n");

	if (roundcard_count == 0 || sc > 1) {
		switch (c) {
		case SPIG :
			if (!allow_playbid[SPADE])
				nbc = 1;
			break;
		case HACE :
			if (!allow_playbid[HEART])
				nbc = 1;
			break;
		case DSHEEP : 
			if (!allow_playbid[DIAMOND])
				nbc = 1;
			break;
		case CTRANS :
			if (!allow_playbid[CLUB])
				nbc = 1;
			break;
		}
		if (nbc)
			return notify_fail("卖过的牌不能在第一轮出！\n");
	}
	for (i = cpos; i < card_count[ms] - 1; i++)
		cards[ms][i] = cards[ms][i+1];
	cards[ms][13 - round_no] = 53;
	roundcards[ms] = c;
	card_count[ms]--;
	if (roundcard_count > 0 && SUIT(c) != SUIT(roundcards[round_order[0]]))
		message_vision("$N垫了一张" + PIG_D->card_str(c) + "！\n", me);
	else
		message_vision("$N出了一张" + PIG_D->card_str(c) + "！\n", me);
	after_play();
	return 1;
}