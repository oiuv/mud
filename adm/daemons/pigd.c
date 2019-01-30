// pigd.c 拱猪 Daemon

// #pragma optimize

#include <pig.h>
inherit F_DBASE;

string *suit_char = ({ "S", "H", "D", "C" });
string *suit_str = ({ "黑桃", "红心", "方块", "梅花" });
string *rank_char = ({ "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A" });
string *rank_str = ({ "２", "３", "４", "５", "６", "７", "８", "９", "⒑", "Ｊ", "Ｑ", "Ｋ", "Ａ" });
string *seat_char = ({ "N", "W", "S", "E" });
string *seat_str = ({ "北", "西", "南", "东" });
int *heart_score = ({ 0, 0, 0, -10, -10, -10, -10, -10, -10, -20, -30, -40, -50 });

int is_validcard(string str)
{
	int i, st, rk;
	string s, r;

	if (strlen(str) != 2 )
		return -1;
	s = capitalize(str[0..0]);
	r = capitalize(str[1..1]);

	st = rk = -1;
	for (i = 0; i < 4; i++)
		if (suit_char[i] == s) {
			st = i; break;
		}
	for (i = 0; i < 13; i++)
		if (rank_char[i] == r) {
			rk = i; break;
		}
	if (st == -1 || rk == -1)
		return -1;
	return st * 13 + rk;
}

int is_validbid(int c)
{
	if (c == SPIG)
		return BID_SPIG;
	if (c == HACE)
		return BID_HACE;
	if (c == DSHEEP)
		return BID_DSHEEP;
	if (c == CTRANS)
		return BID_CTRANS;
	return 0;
}

int is_special(int c)
{
	return c == SPIG || c == DSHEEP || c == CTRANS || SUIT(c) == HEART;
}
	
string card_str(int c)
{
	if (c < 0 || c > 51)
		return "";
	return(suit_str[SUIT(c)] + rank_str[RANK(c)]);
}

string refresh(int *cl, int b, int e)
{
	string output = "";
	int i, ls, ns;
	if (b < 0 || e < 0)
		return output;
	if (cl[b] < 0 || cl[e] > 51)
		return output;
	output = sprintf("%18s%s：", "", suit_str[ls = ns = SUIT(cl[b])]);
	for (i = b; i <= e; i++) {
		ns = SUIT(cl[i]);
		if (ls == ns) 
			output += rank_str[RANK(cl[i])] + " ";
		else {
			output = sprintf("%s\n%18s%s：", output, "",
					suit_str[ls = ns]);
			output += rank_str[RANK(cl[i])] + " ";
		}
	}
	return output + "\n";
}

int has_suit(int *cl, int b, int e, int s)
{
	int i, r = 0;
	for (i = b; i <= e; i++)
		if (SUIT(cl[i]) == s)
			r++;
	return r;
}
int has_card(int *cl, int b, int e, int c)
{
	int i;
	for (i = b; i <= e; i++)
		if(cl[i] == c)
			return 1;
	return 0;
}

void shuffle(int *ol, int *nl, int t)
{
	int i, j, k, l;
	if (sizeof(ol) < 52 || sizeof(nl) < 52) 
		for (i = 0; i < 52; i++)
			ol[i] = nl[i] = i;
	if (t <= 0 || t >= 10) t = 1;
	for (i = 0; i < t; i++) {
		for (j = 0; j < 52; j++) {
			k = 51 - j;
			l = random(k);
			nl[j] = ol[l];
			if (k != l)
				ol[l] = ol[k];
		}
		for (j = 0; j < 52; j++) ol[j] = nl[j];
	}
}
			
string card_cmp4(mapping cl, int s)
{
	int i, bc;
	string bp;
	string *clkeys = keys(cl);

	if (sizeof(cl) != 4)
		return clkeys[0];
	bc = s * 13;
	for (i = 0; i < 4; i++) 
		if (SUIT(cl[clkeys[i]]) == s && cl[clkeys[i]] >= bc)
			bc = cl[bp = clkeys[i]];
	return bp;
}	

string *order_turn(string rw)
{
	if (rw == "east")
		return ({ "east", "north", "west", "south" });
	else if (rw == "north")
		return ({ "north", "west", "south", "east" });
	else if (rw == "west")
		return ({ "west", "south", "east", "north" });
	else 
		return ({ "south", "east", "north", "west" });
}

int count_score(int *fcl, int bid_flag) // support for single pig ONLY
{
	int i, j, pc, doubler, n_heart, cardj, r;
	int *cl = ({});
	
	for (i = 0; i < sizeof(fcl); i++)
		if (fcl[i] == SPIG || fcl[i] == DSHEEP || fcl[i] == CTRANS ||
			SUIT(fcl[i]) == HEART)
			cl += ({ fcl[i] });
	cl = sort_array(cl, 1);
	pc = sizeof(cl);
	r = 0;
	
	if (pc == 16)
		return 1000;
	else if (pc == 1 && cl[0] == SPIG) {
		// single pig  == -100
		r = -100;
		if (bid_flag & BID_SPIG)
			r = -200;
	}
	else if (pc == 13 && cl[0] >= 13 && cl[12] <= 25) {
		// all 13 hearts
		r = 200;
		if (bid_flag & BID_HACE)
			r = 400;
	}
	else if (pc == 1 && cl[0] == CTRANS) {
		r = 50;
		if (bid_flag & BID_CTRANS)
			r = 100;
	}
	else if (pc == 1 && cl[0] == DSHEEP) {
		r = 100;
		if (bid_flag & BID_DSHEEP)
			r = 200;
	}
	else {
		doubler = 1;
		n_heart = 0;
		for (j = 0; j < pc; j++) {
			cardj = cl[j];
			if (cardj >= 13 && cardj <= 25) {
				// a heart
				r += heart_score[cardj % 13];
				if (bid_flag & BID_HACE)
					r += heart_score[cardj % 13];
				n_heart++;
			}
			else if (cardj == SPIG) {
				r -= 100;
				if (bid_flag & BID_SPIG)
					r -= 100;
			}
			else if (cardj == DSHEEP) {
				r += 100;
				if (bid_flag & BID_DSHEEP)
					r += 100;
			}
			else if (cardj == CTRANS) {
				doubler = 2;
				if (bid_flag & BID_CTRANS)
					doubler = 4;
			}
		}
		if (n_heart == 13) {
			r += 400;
			if (bid_flag & BID_HACE)
				r += 400;
		}
		r *= doubler;
	}
	return r;
}

